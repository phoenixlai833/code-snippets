// pages/index.js
import { useState, useEffect } from 'react';
import axios from 'axios'
import NewPostForm from "../components/NewPostForm";
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";
import { useRouter } from 'next/router';
import Link from "next/link";

export default function CreatePost() {
    const [language, setLanguage] = useState('Markdown');
    const [code, setCode] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        await axios.post('/api/posts', { language, code });
        router.push("/");
        return;
    }

    function handleChangeCode(value) {
        // console.log(value);
        setCode(value);
        return;
    }

    function handleChangeLanguage(value) {
        // console.log(value);
        setLanguage(value);
        return;
    }

    return (
        <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">

            <div className='max-w-2xl mx-auto'>

                <NewPostForm onSubmit={handleSubmit} onChangeCode={handleChangeCode} onChangeLanguage={handleChangeLanguage} />

            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}