import 'dotenv/config';
import Koa, { Context, Next } from 'koa';
import bodyParser from 'koa-bodyparser';
import koaJwt from 'koa-jwt';
import userRouter from './user/controllers/user.controller';
import arrayRouter from './array/controllers/array.controller';
import UIRouter from './user/controllers/ui.controller';
import authRouter from './auth/controllers/auth.controller';

const app: Koa = new Koa();

app.use(bodyParser());
app.use(koaJwt({
    secret: process.env.JWT_SECRET as string,
    passthrough: true,
}));

const routes = [userRouter, arrayRouter, UIRouter, authRouter]

routes.forEach(router => {
    app.use(router.routes()).use(router.allowedMethods());
});

const checkMethod = async (ctx: Context, next: Next) => {
    await next();
    if (ctx.method !== 'OPTIONS') {
        ctx.status = 405;
        ctx.body = { message: 'Method not allowed' };
    }
}

app.use(checkMethod)

app.listen(process.env.PORT).on('listening', () => console.log(`Listening on port ${process.env.PORT}`));
