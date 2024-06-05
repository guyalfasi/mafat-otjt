import Router from 'koa-router';
import { Context } from 'koa';
import { array, ArrayEndpoint } from '../domain/Array';
import { authenticate } from '../../auth/application/authenticate';
import { authorizeAdmin } from '../../auth/application/authorizeAdmin';

const router = new Router();

router.use(authenticate);

router.get('/array', async (ctx: Context) => {
    ctx.status = 200;
    ctx.body = { array };
});

router.get('/array/:index', async (ctx: Context) => {
    const index = parseInt(ctx.params.index);
    if (isNaN(index)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid index' };
        return;
    }

    const item = array[index];

    if (item !== undefined) {
        ctx.body = { value: item };
    } else {
        ctx.status = 404;
        ctx.body = { error: "Index out of bounds" };
    }
});

router.post('/array', authorizeAdmin, async (ctx: Context) => {
    const { value } = ctx.request.body as ArrayEndpoint;
    if (!value) {
        ctx.status = 400;
        ctx.body = { error: 'Input missing' };
        return;
    }

    array.push(value);
    ctx.body = { array };
});

router.put('/array/:index', authorizeAdmin, async (ctx: Context) => {
    const index = parseInt(ctx.params.index);
    const { value } = ctx.request.body as ArrayEndpoint;
    if (!value) {
        ctx.status = 400;
        ctx.body = { error: 'Input missing' };
        return;
    }

    if (isNaN(index)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid index' };
        return;
    }

    if (array[index] !== undefined) {
        array[index] = value;
        ctx.body = { message: 'Array updated', array };
    } else {
        ctx.status = 404;
        ctx.body = { message: 'Index out of bounds' };
    }
});

router.delete('/array', authorizeAdmin, async (ctx: Context) => {
    array.pop();
    ctx.status = 200;
    ctx.body = { array };
});

router.delete('/array/:index', authorizeAdmin, async (ctx: Context) => {
    const index = parseInt(ctx.params.index);

    if (isNaN(index)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid index' };
        return;
    }

    if (array[index] !== undefined) {
        array[index] = 0;
        ctx.body = { message: 'Array updated', array };
    } else {
        ctx.status = 404;
        ctx.body = { message: 'Index out of bounds' };
    }
});

export default router;