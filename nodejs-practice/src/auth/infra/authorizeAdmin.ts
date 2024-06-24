import { Context, Next } from "koa";

export const authorizeAdmin = async (ctx: Context, next: Next) => {
    if (!ctx.state.user.isAdmin) {
        ctx.status = 403;
        ctx.body = { message: "You don't have permission to do that" };
        return;
    }
    await next();
};
