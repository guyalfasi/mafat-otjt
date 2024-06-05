import db from './db';
import { UserRepository } from '../domain/User';

const userRepository: UserRepository = {
    get: (username) => db('users').where({ username }).first(),
    create: (user) => db('users').insert(user).returning('*').then(([newUser]) => newUser),
    updateToAdmin: (username) => db('users').where({ username }).update({ isAdmin: true }).returning('*').then(([updatedUser]) => updatedUser)
};

export default userRepository;
