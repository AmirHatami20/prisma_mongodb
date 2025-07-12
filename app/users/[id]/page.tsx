import {getUserById} from '@/app/actions/user';
import {notFound} from 'next/navigation';

export default async function UserPage({params,}: { params: Promise<{ id: string }>; }) {
    const {id} = await params;
    const user = await getUserById(id);

    if (!user) return notFound();

    return (
        <div className="max-w-xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-500 mb-4">{user.email}</p>

            <div className="mb-4">
                <p>📝 Posts: {user._count.posts}</p>
                <p>💬 Comments: {user._count.comments}</p>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Recent Posts</h2>
                <ul className="list-disc ml-5">
                    {user.posts.map((post) => (
                        <li key={post.id}>
                            <strong>{post.title}</strong> —{' '}
                            {new Date(post.createdAt).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
