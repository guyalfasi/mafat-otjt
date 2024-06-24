import Router from 'koa-router';
import { Context } from 'koa';
import { User } from '../domain/user'
import userRepository from '../infra/userRepository';
import { authorizeAdmin, validateUser } from '../../auth/infra/authUtils';

const router = new Router();

router.post('/admin/promote', validateUser, authorizeAdmin, async (ctx: Context) => {
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
