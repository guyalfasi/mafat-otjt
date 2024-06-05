import Router from 'koa-router';
import { Context } from 'koa';
import { User } from '../domain/User';
import { authenticate } from '../../auth/application/authenticate';

const router = new Router();

router.use(authenticate);

router.get('/', async (ctx: Context) => {
    const user = ctx.state.user as User;
    const currentDate = new Date().toLocaleDateString();
    ctx.body = { message: `Hello ${user.username}, today is ${currentDate}` };
});

router.get('/echo', async (ctx: Context) => {
    const message = ctx.query.msg as string;
    if (message) {
        ctx.body = { message: `The message is ${message}` };
    } else {
        ctx.status = 400;
        ctx.body = { message: `Message field missing` };
    }
});

export default router;
