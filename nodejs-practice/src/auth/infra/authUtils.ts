import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { userEncode } from '../domain/auth';

export const validateUser = async (ctx: Context, next: Next) => {
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

export const authorizeAdmin = async (ctx: Context, next: Next) => {
    if (!ctx.state.user.isAdmin) {
        ctx.status = 403;
        ctx.body = { message: "You don't have permission to do that" };
        return;
    }
    await next();
};

export const createToken = (payload: userEncode) => jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' })

