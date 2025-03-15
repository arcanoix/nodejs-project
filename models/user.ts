import { compare, hash } from "bcrypt";
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


/**
 * Find a user by the given email.
 * 
 * @params {string} email - the email of the user
 * @returns {User|undefined} the found user
 */
export const findUserByEmail = (email: string): User | undefined => {
    return users.get(email);
}

/** validate a user password
 * @params {User} user - The user whose password is to be validated
 * @params {string} password - The password to validate
 * @returns {Promise<boolean>} true if the password is valid, false otherwise
 */
export const validatePassword = async (user: User, password: string): Promise<boolean> => {
    return compare(password, user.password);
}

/** Remove refreshToken
 * @params {string} email - The refreshToken to remove
 * @return {boolean} true if the refreshToken was removed, false otherwise
 */
export const removeUserToken = (email: string): boolean => {
   const foundUser = users.get(email)

   if(!foundUser) return false;

   users.set(email, { ...foundUser, refreshToken: undefined });

   return true;
}
