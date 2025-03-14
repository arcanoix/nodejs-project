import { hash } from "bcrypt";
import { email, minLength, object, pipe, string, type InferInput } from "valibot";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(8));

export const authSchema = object({
    email: emailSchema,
    password: passwordSchema
})


export enum Rol {
    "ADMIN" = "admin",
    "USER" = "user"
}

export type User = InferInput<typeof authSchema> & {
    id: number;
    rol: "admin" | "user";
    refreshToken?: string;
};


const users: Map<string, User> = new Map();



/**
 * Create a new user the given email and password.
 * The password is hashed before storing it.
 * 
 * @params {string} email - the email of the user
 * @params {string} password - the password of the user
 * @returns {Promise<User>} the created user
 */
export const createUser = async (email: string, password: string): Promise<User> => { 
    const hashedPassword = await hash(password, 10);

    const newUser: User = {
        id: Date.now(),
        email,
        password: hashedPassword,
        rol: Rol.USER
    }
    
    users.set(email, newUser);

    return newUser;
}