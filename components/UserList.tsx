'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from 'next/link';

import {Trash} from "lucide-react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

import {deleteUser} from "@/app/actions/user";

import {User} from '@prisma/client';
import {useRouter} from "next/navigation";

type UserWithCounts = User & {
    _count: {
        comments: number;
        posts: number;
    };
};

interface UserListProps {
    initialUsers: UserWithCounts[];
}

export default function UserList({initialUsers}: UserListProps) {
    const router = useRouter();

    const handleDeleteUser = async (id: string) => {
        await deleteUser(id)

        toast.success("User Removed successfully");
        router.refresh();
    }

    return (
        <Card className="shadow-sm bg-white max-h-[415px] overflow-y-auto border-0 pt-0">
            <CardHeader className="bg-blue-50 border-b px-6 py-5 rounded-none">
                <CardTitle className="text-xl text-blue-900">Users</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-0">
                {initialUsers.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic">
                        No users found. Create your first user!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {initialUsers.map(user => (
                            <div
                                key={user.id}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <Link href={`/users/${user.id}`}
                                          className="font-medium text-lg text-gray-900 group-hover:text-blue-700"
                                    >
                                        {user.name || 'No name'}
                                    </Link>
                                    <Button
                                        className="cursor-pointer w-7 h-7 bg-red-600 text-white rounded-full"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash size={18}/>
                                    </Button>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {user.email}
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                    <div
                                        className="flex items-center bg-gray-100 group-hover:bg-white px-3 py-1 rounded-full"
                                    >
                                        <span className="font-medium mr-1">Posts:</span>
                                        <span className="text-blue-600 font-medium">
                                            {user._count?.posts || 0}
                                        </span>
                                    </div>
                                    <div
                                        className="flex items-center bg-gray-100 group-hover:bg-white px-3 py-1 rounded-full"
                                    >
                                        <span className="font-medium mr-1">Comments:</span>
                                        <span className="text-blue-600 font-medium">
                                            {user._count?.comments || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
