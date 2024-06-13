export interface User {
    id: string;
    username: string;
    password: string;
    isAdmin: boolean;
    secretAdminPassword?: string;
}

export interface UserRepository {
    get: (username: string) => Promise<User | undefined>;
    registerUser: (user: Partial<User>) => Promise<User>;
    promoteToAdmin: (username: string) => Promise<User>;
}