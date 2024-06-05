export interface User {
    id: string;
    username: string;
    password: string;
    isAdmin: boolean;
    secretAdminPassword?: string;
}

export interface UserRepository {
    get: (username: string) => Promise<User | undefined>;
    create: (user: Partial<User>) => Promise<User>;
    updateToAdmin: (username: string) => Promise<User>;
}