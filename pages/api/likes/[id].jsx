import { prisma } from '../../../server/db/client';
import { authOptions } from '../auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";

export default async function handler(req, res) {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ error: 'unauthorized' })
        return;
    }

    const prismaUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })


    if (req.method === "DELETE") {
        // console.log(req.query.id)
        // console.log(prismaUser.id)
        const postId = req.query.id
        const postLikes = await prisma.like.findMany({
            where: {
                userId: prismaUser.id
            }
        })
        const likeToDelete = postLikes.filter((p) => p.postId == postId)
        const likeId = likeToDelete[0].id
        await prisma.like.delete({
            where: {
                id: likeId
            },
        })
        res.status(200).end('deleted')
    }
}