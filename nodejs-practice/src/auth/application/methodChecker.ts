import { Context, Next } from "koa";

export const methodChecker = async (ctx: Context, next: Next) => {
    await next();
    if (ctx.method !== 'OPTIONS') {
        ctx.status = 405;
        ctx.body = { message: 'Method not allowed' }
    }
}
