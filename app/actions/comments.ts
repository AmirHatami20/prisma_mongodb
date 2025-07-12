"use server"

import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache"

interface PostCreateComment {
    content: string,
    postId: string,
    authorId: string,
}

// CREATE Comment
export async function createComment({content, postId, authorId}: PostCreateComment) {
    if (!content || !postId || !authorId) {
        throw new Error('Content, post, and author are required');
    }

    // Ensure both the post and author exist
    const postExists = await prisma.post.findUnique({
        where: {id: postId}
    });

    const authorExists = await prisma.user.findUnique({
        where: {id: authorId}
    });

    if (!postExists) {
        throw new Error('Post not found');
    }

    if (!authorExists) {
        throw new Error('Author not found');
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                post: {
                    connect: {id: postId}
                },
                author: {
                    connect: {id: authorId}
                }
            },
            include: {
                author: true,
                post: true
            }
        });

        // Revalidate the home page to show the new comment
        revalidatePath('/');

        return comment;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

// DELETE Comment
export async function deleteComment(id: string) {
    try {
        return await prisma.comment.delete({
            where: {id}
        });

    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
    }
}