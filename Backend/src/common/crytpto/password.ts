import * as argon2 from 'argon2';

export async function hashPassword(plain: string, pepper?: string) {
    const value = pepper ? plain + pepper : plain;
    return argon2.hash(value,{ type: argon2.argon2id});
}

export async function verifyPassword(hash: string, plain: string, pepper?: string){
    const value = pepper ? plain + pepper : plain;
    return argon2.verify(hash, value);
}