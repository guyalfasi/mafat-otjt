import Router from 'koa-router';
import { Context } from 'koa';
import { User } from '../domain/User'
import bcrypt from 'bcrypt';
import { authenticate } from '../../auth/application/authenticate';
import { authorizeAdmin } from '../../auth/application/authorizeAdmin';
import userRepository from '../infra/UserRepository';
import { createToken } from '../../auth/application/createToken';

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
    const newUser = await userRepository.create({ username: username, password: hashedPassword, isAdmin: secretAdminPassword === process.env.SECRET_ADMIN_PASSWORD });

    ctx.status = 201;
    ctx.body = { message: 'User registered successfully', user: newUser };
});

router.post('/admin', authenticate, authorizeAdmin, async (ctx: Context) => {
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

    const updatedUser = await userRepository.updateToAdmin(username);
    ctx.status = 200;
    ctx.body = { message: "Changed permissions for user", newAdmin: updatedUser };
});

router.post('/logout', authenticate, async (ctx: Context) => {
    ctx.cookies.set('auth', '', { httpOnly: true, expires: new Date(0) });
    ctx.status = 200;
    ctx.body = { message: 'Logout successful' };
});

export default router;
