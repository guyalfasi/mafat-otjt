import db from './db';
import { User, UserRepository } from '../domain/user';

const userRepository: UserRepository = {
    get: (username) => db<User>('users').where({ username }).first(),
    registerUser: (user) => db<User>('users').insert(user).returning('*').then(([newUser]) => newUser),
    promoteToAdmin: (username) => db<User>('users').where({ username }).update({ isAdmin: true }).returning('*').then(([updatedUser]) => updatedUser)
};

export default userRepository;
