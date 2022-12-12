import { prisma } from '../../server/db/client'
import { authOptions } from './auth/[...nextauth]';
import { unstable_getServerSession } from "next-auth/next";

export default async function handle(req, res) {
    const { method } = req

    switch (method) {
        case 'POST':
            // check if user is logged in, if not direct to log in
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

            console.log(session.user)

            // get the title and content from the request body
            const { language, code } = req.body
            // use prisma to create a new post using that data
            const post = await prisma.post.create({
                data: {
                    language,
                    code,
                    userId: prismaUser.id,
                }
            })
            // send the post object back to the client
            res.status(201).json(post)
            break

        case 'PUT':
            let { postId, type, action } = req.body
            if (type == "comment") {
                console.log("its a comment")
                const updatedPost = await prisma.post.update({
                    where: {
                        id: postId,
                    },
                    data: {
                        totalComments: {
                            increment: 1,
                        }
                    }
                })
                res.status(201).json(updatedPost)
            } else {
                console.log(action)
                if (action == "delete") {
                    await prisma.post.update({
                        where: {
                            id: postId,
                        },
                        data: {
                            totalLikes: {
                                increment: -1,
                            }
                        }
                    })
                    res.status(200).end("decrease like")
                } else {
                    const updatedPost = await prisma.post.update({
                        where: {
                            id: postId,
                        },
                        data: {
                            totalLikes: {
                                increment: 1,
                            }
                        }
                    })
                    res.status(201).json(updatedPost)
                }
            }
            break
        default:
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
