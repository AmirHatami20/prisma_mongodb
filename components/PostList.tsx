'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {useRouter} from 'next/navigation';
import {formatDistance} from 'date-fns';
import {createComment, deleteComment} from '@/app/actions/comments';
import {deletePost} from '@/app/actions/posts';

import type {Post, User, Comment} from '@prisma/client';
import {Trash} from "lucide-react";

type PostWithRelations = Post & {
    author: User;
    comments: (Comment & {
        author: User;
    })[];
    _count: {
        comments: number;
    };
};

interface PostListProps {
    initialPosts: PostWithRelations[];
}

export default function PostList({initialPosts}: PostListProps) {
    const [commentContents, setCommentContents] = useState<{ [key: string]: string }>({});
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<string | null>(null);

    const router = useRouter();

    const handleCommentChange = (postId: string, content: string) => {
        setCommentContents(prev => ({
            ...prev,
            [postId]: content
        }));
    };

    const handleSubmitComment = async (postId: string, authorId: string) => {
        const content = commentContents[postId];

        if (!content) {
            toast.error("Comment cannot be empty");
            return;
        }

        setSubmitting(postId);
        try {
            await createComment({
                content,
                postId,
                authorId
            });

            // Clear the input
            setCommentContents(prev => ({
                ...prev,
                [postId]: ''
            }));

            toast.success("Comment added successfully");
            router.refresh();

        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error((error as Error).message || "Failed to create user");
        } finally {
            setSubmitting(null);
        }
    };

    const handleDeletePost = async (id: string) => {
        await deletePost(id)

        toast.success("Post deleted successfully");

        // Refresh the page data to show the new user
        router.refresh();
    }

    const handleDeleteComment = async (id: string) => {
        await deleteComment(id)

        toast.success("Comment deleted successfully");

        // Refresh the page data to show the new user
        router.refresh();
    }

    const toggleComments = (postId: string) => {
        setExpandedPost(expandedPost === postId ? null : postId);
    };

    return (
        <Card className="shadow-sm bg-white max-h-[573px] overflow-auto border-0 pt-0">
            <CardHeader className="bg-green-50 border-b px-6 py-5 rounded-none">
                <CardTitle className="text-xl text-green-900">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {initialPosts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic">
                        No posts found. Create your first post!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {initialPosts.map(post => (
                            <Card key={post.id} className="border-0 gap-3 shadow-sm overflow-hidden bg-white pt-0 pb-0">
                                <CardHeader className="pb-3 bg-gray-50 border-b px-5 py-4 rounded-none">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl font-bold text-gray-800">{post.title}</CardTitle>
                                        <div className="flex gap-x-1 items-center">
                                            {!post.published && (
                                                <span
                                                    className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium"
                                                >
                                                Draft
                                            </span>
                                            )}
                                            <Button
                                                className="cursor-pointer w-7 h-7 bg-red-600 text-white rounded-full"
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                <Trash size={18}/>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        By {" "}
                                        <span className="font-medium">
                                            {post.author.name || post.author.email}
                                        </span>•
                                        <span className="ml-1">
                                            {formatDistance(new Date(post.createdAt), new Date(), {addSuffix: true})}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5">
                                    <p className="text-gray-700 leading-relaxed">{post.content || 'No content'}</p>
                                </CardContent>
                                <CardFooter className="flex flex-col items-start pt-0 pb-4 px-5 border-t bg-gray-50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleComments(post.id)}
                                        className="px-0 text-xs text-green-700 hover:bg-transparent hover:text-green-800 hover:underline"
                                    >
                                        <span className="font-medium mr-1">{post._count.comments}</span>
                                        {post._count.comments === 1 ? 'comment' : 'comments'} •
                                        <span className="ml-1">{expandedPost === post.id ? 'Hide' : 'Show'}</span>
                                    </Button>

                                    {expandedPost === post.id && (
                                        <div className="w-full mt-4 space-y-4">
                                            {post.comments.length > 0 ? (
                                                <div className="space-y-3 mb-4">
                                                    {post.comments.map(comment => (
                                                        <div
                                                            key={comment.id}
                                                            className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-200"
                                                        >
                                                            <div className="flex flex-col">
                                                                <div className="font-medium text-xs text-gray-700 mb-1">
                                                                    {comment.author.name || comment.author.email}
                                                                </div>
                                                                <div
                                                                    className="text-sm text-gray-800">{comment.content}</div>
                                                            </div>
                                                            <Button
                                                                className="cursor-pointer w-7 h-7 bg-red-600 text-white rounded-full"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >
                                                                <Trash size={18}/>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 mb-3 italic">No comments yet</div>
                                            )}

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add a comment..."
                                                    value={commentContents[post.id] || ''}
                                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                    className="h-10 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                />
                                                <Button
                                                    size="sm"
                                                    disabled={submitting === post.id || !commentContents[post.id]}
                                                    onClick={() => handleSubmitComment(post.id, post.author.id)}
                                                    className="px-4 h-10 bg-green-600 hover:bg-green-700"
                                                >
                                                    {submitting === post.id ? 'Posting...' : 'Post'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
