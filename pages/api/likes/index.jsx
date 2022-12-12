import { prisma } from '../../../server/db/client'
import { authOptions } from '../auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";

export default async function handle(req, res) {
    const { method } = req

    switch (method) {
        case 'POST':
            const session = await unstable_getServerSession(req, res, authOptions)
            if (!session) {
                res.status(401).json({ error: 'unauthorized' })
                return;
            }

            const prismaUser = await prisma.user.findUnique({
                where: { email: session.user.email }
            })

            if (!prismaUser) {
                res.status(401).json({ error: "Unauthorized" })
            }
            // get the title and content from the request body
            console.log(req.body)
            const { postId } = req.body
            // use prisma to create a new post using that data
            const newLike = await prisma.like.create({
                data: {
                    updatedAt: new Date(),
                    postId: postId,
                    userId: prismaUser.id
                }
            })
            // send the post object back to the client
            res.status(201).json(newLike)
            break
        default:
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}