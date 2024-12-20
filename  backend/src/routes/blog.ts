import { Hono } from "hono";
import { verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Variables } from "hono/types";
export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JET_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();
// https://backend.sunnysrivastava258.workers.dev

blogRouter.use('/*', async (c, next) => {

    const header = c.req.header("authorization") || "";
    const user = await verify(header, c.env.JET_SECRET);
    try {
        if (user) {
            // @ts-ignore
            c.set("userId", user.id);
            await next();
        }
        else {
            c.status(403)
            return c.json({
                error: "You are not  logged in "
            })
        }
    } catch (error) {
        c.status(403)
        return c.json({
            message: "You are not  logged in "
        })
    }
})


blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId,
        }
    })

    return c.json({
        id: blog.id
    })

})
blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,

        }
    })
    return c.json({
        id: blog.id
    })

})


blogRouter.get('/bulk', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.post.findMany();
    return c.json({
        blogs
    })

})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id
            }
        })
        return c.json({
            blog
        })
    } catch (error) {
        c.status(401)
        return c.json({
            message: "Error while fetching the post"
        });
    }

})

