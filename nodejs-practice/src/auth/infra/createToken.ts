import jwt from 'jsonwebtoken';
import { userPayload } from '../domain/auth';

export const createToken = (payload: userPayload) => jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' })
