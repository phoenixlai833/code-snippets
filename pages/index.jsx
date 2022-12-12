// pages/index.js
import { prisma } from '../server/db/client';
import { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import Router from "next/router";
import { useSession } from "next-auth/react";
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";
import Button from "../components/Button";
import PostSmall from "../components/PostSmall";
import Link from "next/link";
import axios from 'axios';

export default function Home(props) {
  const { data: session } = useSession()
  const router = useRouter();
  const [posts, setPosts] = useState(props.posts)

  // Add a use effect in case the posts change when routing to the home page
  useEffect(() => {
    setPosts(props.posts)
  }, [props.posts])

  console.log(posts)
  async function handleLike(post) {
    if (session) {
      const postId = post.id;
      let type = "like";
      if (post.liked == false) {
        console.log("add like")
        await axios.post('/api/likes', { postId });
        let action = "add";
        await axios.put('/api/posts', { postId, type, action });
        Router.reload();
      } else {
        console.log("delete like")
        await axios.delete(`/api/likes/${postId}`);
        let action = "delete";
        await axios.put('/api/posts', { postId, type, action });
        Router.reload();
      }
      return;
    } else {
      router.push(`/api/auth/signin`)
    }
  }

  function handleShare() {
    return;
  }

  return (
    <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">

      <div className='max-w-2xl mx-auto'>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          <span className="block">Welcome to</span>
          <span className="block text-indigo-300">Your Assignment</span>
        </h1>

        <Link href={"/createPost"}>
          <Button text={"Create a Post"} />
        </Link>
        <br />
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <PostSmall key={post.id} onLike={() => handleLike(post)} onComment={() => router.push(`/code/${post.id}`)} onShare={handleShare} href={`/code/${post.id}`} post={post} user={post.user} />
            </li>
          ))}
        </ul>
      </div>
    </div >
  )
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (session) {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: true,

      }
    })

    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

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

    return {
      props: {
        posts: JSON.parse(JSON.stringify(posts)),
        likes: JSON.parse(JSON.stringify(likes)),
      }
    }
  }

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: true
    }
  })

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    }
  }
}
