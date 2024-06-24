import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';

export const validate = async (ctx: Context, next: Next) => {
    const token = ctx.cookies.get('auth');
    if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'Authentication Error: User not logged in' };
        return;
    }

    try {
        const decodedSessionUser = jwt.verify(token, process.env.JWT_SECRET as string);
        ctx.state.user = decodedSessionUser;
        await next();
    } catch (err) {
        ctx.status = 400;
        ctx.body = { error: 'Authentication Error: Invalid token' };
    }
};