import UserForm from '@/components/UserForm';
import UserList from '@/components/UserList';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';

import {getUsers} from '@/app/actions/user';
import {getPosts} from '@/app/actions/posts';

function SectionHeader({title, color}: { title: string; color?: string }) {
    return (
        <div className="flex items-center mb-8">
            <div className={`h-10 w-2 rounded-full mr-3 ${color}`}></div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
    );
}

export default async function Home() {
    // Server-side data fetching using our server actions
    const users = await getUsers();
    const posts = await getPosts(5);

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <h1 className="text-3xl font-bold mb-13 text-center text-gray-800">
                    Prisma + MongoDB User Management
                </h1>
                {/* Users */}
                <section className="mb-16">
                    <SectionHeader
                        title="Users"
                        color={"bg-blue-500"}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <UserForm/>
                        <UserList initialUsers={users}/>
                    </div>
                </section>
                {/* Posts */}
                <section>
                    <SectionHeader
                        title="Posts"
                        color={"bg-green-500"}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PostForm users={users}/>
                        <PostList initialPosts={posts}/>
                    </div>
                </section>
            </div>
        </main>
    );
}
