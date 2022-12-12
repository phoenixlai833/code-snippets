import { prisma } from '../../server/db/client'
import { useState, useEffect, useRef } from 'react';
import Router from "next/router";
import Post from "../../components/Post";
import CommentForm from "../../components/CommentForm";
import Comments from "../../components/Comments";
import axios from 'axios';
import { useSession } from "next-auth/react";
import { authOptions } from '../api/auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";

export default function SinglePost(props) {
    const { data: session } = useSession()
    const [post, setPost] = useState(props.post);
    const [user, setUser] = useState(props.user); //props.post.user
    const [comments, setComments] = useState(props.comments);
    const [likes, setLikes] = useState(props.likes);
    const [heart, setHeart] = useState(props.heart);
    // const [toggleLiked, setToggleLiked] = useState(heart);
    const textInputRef = useRef(null);

    useEffect(() => {
        setPost(props.post)
    }, [props.post])

    useEffect(() => {
        setUser(props.user)
    }, [props.user])

    useEffect(() => {
        setComments(props.comments)
    }, [props.comments])

    useEffect(() => {
        setLikes(props.likes)
    }, [props.likes])

    function handleComment() {
        textInputRef.current.focus();
        return;
    }

    const handleLike = async () => {
        if (session) {
            const postId = post.id;
            let type = "like";
            if (heart == false) {
                console.log("add like")
                // console.log(postId);
                await axios.post('/api/likes', { postId });
                let action = "add";
                await axios.put('/api/posts', { postId, type, action });
                setHeart(true);
                Router.reload();
            } else {
                console.log("delete like")
                await axios.delete(`/api/likes/${postId}`);
                let action = "delete";
                await axios.put('/api/posts', { postId, type, action });
                Router.reload();
            }
        } else {
            Router.push(`/api/auth/signin`)
        }
    }

    function handleShare() {
        //axios to share?
        return;
    }

    const handleSubmit = async (content) => {
        // console.log(content);
        const postId = post.id;
        await axios.post('/api/comments', { content, postId });
        let type = "comment";
        await axios.put('/api/posts', { postId, type });
        Router.reload();
    }

    return (
        <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">

            <div className='max-w-2xl mx-auto'>

                <Post onComment={handleComment} onLike={handleLike} onShare={handleShare} liked={heart} post={post} user={user} />

                <CommentForm onSubmit={handleSubmit} user={user} textareaRef={textInputRef} />

                <Comments comments={comments} className={"hi"} />

            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if (session) {
        const post = await prisma.post.findUnique({
            where: { id: context.params.id }
        })

        const prismaUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        const liked = await prisma.like.findMany({
            where: {
                userId: prismaUser.id,
                postId: post.id
            }
        })

        // console.log(liked)

        const heart = liked.length == 0 ? false : true

        const user = await prisma.user.findUnique({
            where: { id: post.userId }
        })

        const comments = await prisma.comment.findMany({
            where: {
                postId: context.params.id,
            },
            include: {
                user: true
            }
        })

        const likes = await prisma.like.findMany({
            where: { postId: context.params.id }
        })

        return {
            props: {
                post: JSON.parse(JSON.stringify(post)),
                user: JSON.parse(JSON.stringify(user)),
                comments: JSON.parse(JSON.stringify(comments)),
                likes: JSON.parse(JSON.stringify(likes)),
                heart: JSON.parse(JSON.stringify(heart))
            }
        }


    }

    const post = await prisma.post.findUnique({
        where: { id: context.params.id }
    })

    const user = await prisma.user.findUnique({
        where: { id: post.userId }
    })

    const comments = await prisma.comment.findMany({
        where: {
            postId: context.params.id,
        },
        include: {
            user: true
        }
    })

    const likes = await prisma.like.findMany({
        where: { postId: context.params.id }
    })

    return {
        props: {
            post: JSON.parse(JSON.stringify(post)),
            user: JSON.parse(JSON.stringify(user)),
            comments: JSON.parse(JSON.stringify(comments)),
            likes: JSON.parse(JSON.stringify(likes)),
        }
    }
}

