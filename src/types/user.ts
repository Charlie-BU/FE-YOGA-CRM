export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    date: string;
}

export interface Register {
    username: string;
    gender: number;
    phone: string;
    address?: string;
    department?: number;
    vocation?: number;
    status?: number;
    usertype: number;
    password: string;
    password2: string;
}
