import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign, verify } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JET_SECRET: string,
  }
}>()

app.use('/api/v1/blog/*', async (c, next) => {
  // get the header
  // verify the header
  const header = c.req.header("authorization") || "";
  const response = await verify(header, c.env.JET_SECRET);
  if (response.id) {
    await next();
  }
  else{
    c.status(403)
    return c.json({
      error:"unautorized"
    })
  }
})

app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();  // Extracting the body for the parameters
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    }
  });

  const token = await sign({ id: user.id }, c.env.JET_SECRET)
  return c.json({
    jwt: token
  })
})
app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();  // Extracting the body for the parameters
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });
  if (!user) {
    c.status(403);
    return c.json({
      error: "User not found  "
    })
  }
  const jwt = await sign({ id: user.id }, c.env.JET_SECRET)
  return c.json({
    jwt
  })
})
app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello  ')
})

export default app
