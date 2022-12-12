import { useSession, signIn, signOut } from "next-auth/react";
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";
import Button from "../components/Button";
import Post from "../components/Post";
import Router from "next/router";
import { useState } from "react";
import Link from "next/link";

export default function Component(props) {
    const { data: session } = useSession()
    const [posts, setPosts] = useState(props.posts)

    function handleShare() {
        return;
    }

    if (session) {
        return (
            <>
                <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
                    <div className='max-w-2xl mx-auto'>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
                            <span className="block">Hello,</span>
                            <span className="block text-indigo-300">{session.user.name.split(" ")[0]}</span>
                        </h1>
                        <br />
                        <h2 className="text-xl font-bold tracking-tight text-gray-100 sm:text-xl">Signed in as <span className="text-indigo-300">{session.user.email} </span></h2>
                        <br />
                        <img className="w-1/2" src={session.user.image}></img>
                        <br />
                        <Link href={"/api/auth/signout"}>
                            <Button text={"Sign out"} />
                        </Link>
                        <br />
                        <ul>
                            {posts.map((post) => (
                                <li key={post.id}>
                                    <Post onComment={() => Router.push(`/code/${post.id}`)} onLike={() => Router.push(`/code/${post.id}`)} onShare={handleShare} liked={post.liked} post={post} user={post.user} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        )
    }
    return (
        <>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>
        </>
    )
}

export async function getServerSideProps(context) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: "desc"
        },
        where: {
            userId: prismaUser.id,
        },
        include: {
            user: true,

        }
    })

    console.log(posts)

    posts.map(async (p) => {
        const liked = await prisma.like.findMany({
            where: {
                userId: prismaUser.id,
                postId: p.id
            }
        })
        liked.length == 0 ? p.liked = false : p.liked = true;
    })

    const likes = await prisma.like.findMany({
        where: {
            userId: prismaUser.id,
        }
    })

    console.log(posts)

    return {
        props: {
            posts: JSON.parse(JSON.stringify(posts)),
        },
    }
}