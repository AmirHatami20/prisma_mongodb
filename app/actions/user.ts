"use server"

import prisma from "@/lib/prisma";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {revalidatePath} from "next/cache";

// GET User
export async function getUsers() {
    try {
        return await prisma.user.findMany({
            include: {
                posts: true,
                _count: {
                    select: {comments: true, posts: true}
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
}

// GET User by id
export async function getUserById(id: string) {
    try {
        return await prisma.user.findUnique({
            where: {id},
            include: {
                posts: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                comments: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                _count: {
                    select: {comments: true, posts: true}
                },
            },
        });
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
    }
}

// CREATE User
export async function createUser({email, name}: { email: string; name: string }) {
    if (!email.trim()) {
        throw new Error('Email is required');
    }

    try {
        const user = await prisma.user.create({
            data: {email, name},
        });

        revalidatePath('/');
        return user;
    } catch (error: unknown) {
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2002' &&
            Array.isArray(error.meta?.target) &&
            error.meta.target.includes('email')
        ) {
            throw new Error('A user with this email already exists');
        }

        console.error('[CreateUserError]', error);
        throw new Error('Failed to create user');
    }
}

// REMOVE User
export async function deleteUser(id: string) {
    try {
        // Delete related comments and posts in parallel
        await Promise.all([
            prisma.comment.deleteMany({where: {authorId: id}}),
            prisma.post.deleteMany({where: {authorId: id}}),
        ]);

        // Delete user
        const result = await prisma.user.delete({where: {id}});

        revalidatePath('/');
        return result;
    } catch (error) {
        console.error(`[deleteUser] Error deleting user with ID ${id}:`, error);
        throw new Error('Failed to delete user');
    }
}
