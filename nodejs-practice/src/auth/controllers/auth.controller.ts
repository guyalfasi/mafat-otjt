import { Context } from 'koa';
import Router from 'koa-router';
import { User } from '../../user/domain/user';
import userRepository from '../../user/infra/userRepository';
import bcrypt from 'bcrypt';
import { createToken } from '../infra/authUtils';

const router = new Router();

router.post('/login', async (ctx: Context) => {
    const { username, password } = ctx.request.body as User;

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: 'One or more fields missing' };
        return;
    }

    const user = await userRepository.get(username);

    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
        return;
    }

    if (!await bcrypt.compare(password, user.password)) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid password' };
        return;
    }

    const token = createToken({ id: user.id, username: user.username, isAdmin: user.isAdmin });

    ctx.cookies.set('auth', token, { httpOnly: true });
    ctx.body = { message: 'Login successful', user: user, token: token };
});

router.post('/register', async (ctx: Context) => {
    const { username, password, secretAdminPassword } = ctx.request.body as User;

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: 'One or more fields missing' };
        return;
    }

    const existingUser = await userRepository.get(username);

    if (existingUser) {
        ctx.status = 400;
        ctx.body = { error: 'Username already exists' }
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepository.registerUser({ username: username, password: hashedPassword, isAdmin: secretAdminPassword === process.env.SECRET_ADMIN_PASSWORD });

    ctx.status = 201;
    ctx.body = { message: 'User registered successfully', user: newUser };
});

export default router;