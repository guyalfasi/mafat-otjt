import Router from 'koa-router';
import { Context } from 'koa';
import { array, ArrayItem } from '../domain/array';
import { authorizeAdmin, validateUser } from '../../auth/infra/authUtils';

const router = new Router({ prefix: '/array'});

router.use(validateUser); 

router.get('/', async (ctx: Context) => {
    ctx.status = 200;
    ctx.body = { array };
});

router.get('/:index', async (ctx: Context) => {
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

router.post('/', authorizeAdmin, async (ctx: Context) => {
    const { value } = ctx.request.body as { value: ArrayItem};
    if (!value) {
        ctx.status = 400;
        ctx.body = { error: 'Input missing' };
        return;
    }

    array.push(value);
    ctx.body = { array };
});

router.put('/:index', authorizeAdmin, async (ctx: Context) => {
    const index = parseInt(ctx.params.index);
    const { value } = ctx.request.body as { value: ArrayItem};
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

router.delete('/', authorizeAdmin, async (ctx: Context) => {
    if (array.length) {
        array.pop();
        ctx.status = 200;
        ctx.body = { array };
    } else {
        ctx.status = 200;
        ctx.body = { message: 'Array is empty' };
    }
});

router.delete('/:index', authorizeAdmin, async (ctx: Context) => {
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