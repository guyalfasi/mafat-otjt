import Router from 'koa-router';
import { Context } from 'koa';
import { User } from '../domain/user'
import { validate } from '../../auth/controllers/validate';
import { authorizeAdmin } from '../../auth/controllers/authorizeAdmin';
import userRepository from '../infra/userRepository';

const router = new Router();

router.post('/admin/promote', validate, authorizeAdmin, async (ctx: Context) => {
    const { username } = ctx.request.body as User;

    const user = await userRepository.get(username);

    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' }
        return;
    }

    if (user.isAdmin) {
        ctx.status = 200;
        ctx.body = { message: 'User is already an admin' }
        return;
    }

    const updatedUser = await userRepository.promoteToAdmin(username);
    ctx.status = 200;
    ctx.body = { message: "Changed permissions for user", newAdmin: updatedUser };
});

export default router;
