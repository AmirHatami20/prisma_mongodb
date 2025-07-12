"use server"

import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

interface PostCreateInput {
    title: string;
    content?: string;
    authorId: string;
    published?: boolean;
}

// GET Posts
export async function getPosts(limit = 5) {
    try {
        return await prisma.post.findMany({
            include: {
                author: true,
                comments: {
                    include: {
                        author: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {comments: true}
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error('Failed to fetch posts');
    }
}

// CREATE Posts
export async function createPost({title, content, authorId, published = false}: PostCreateInput) {
    if (!title || !authorId) {
        throw new Error('Title and author are required');
    }
    // Ensure the author exists
    const authorExists = await prisma.user.findUnique({
        where: {id: authorId}
    });

    if (!authorExists) {
        throw new Error('Author not found');
    }

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
                published,
                author: {
                    connect: {id: authorId}
                }
            },
            include: {
                author: true
            }
        });

        // Revalidate the home page to show the new post
        revalidatePath('/');

        return post;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// DELETE Posts
export async function deletePost(id: string) {
    try {
        await prisma.comment.deleteMany({where: {postId: id}});

        const post = await prisma.post.delete({
            where: {id}
        });

        revalidatePath('/');
        return post;
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
    }
}