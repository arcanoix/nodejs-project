import type { IncomingMessage, ServerResponse } from "http";
import { addRevokeToken, authSchema, createUser, findUserByEmail, HttpMethod, removeUserToken, validatePassword } from "../models";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import config from "../config";
import type { AuthenticatedRequest } from "../middleware/authentication";

export const authRouter = async (req: IncomingMessage, res: ServerResponse) => {
    const {method, url} = req;

    if(url === "/auth/register" && method === HttpMethod.POST) {
        // Register user
        const body = await parseBody(req);
        const result = safeParse(authSchema, body);

        if(result.issues)
        {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid body" }));
            return;
        }

        // Save user
        const {password, email} = body;

        try{
            const user = await createUser(email, password);
            res.statusCode = 201;
            res.end(JSON.stringify(user));

        }catch(err) {
            if(err instanceof Error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: err.message }));
            } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ message: "Internal server error" }));
            }
        }
    }

    if(url === "/auth/login" && method === HttpMethod.POST) {
        // Login user
        const body = await parseBody(req);
        const result = safeParse(authSchema, body);

        if(result.issues)
        {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid body" }));
            return;
        }

        // Login user
        const {password, email} = body;
        const user = findUserByEmail(email);

            if(!user || !(await validatePassword(user, password)))
            {
                res.statusCode = 401;
                res.end(JSON.stringify({ message: "Invalid email or password" }));
                return;
            }

            const accessToken = sign(
                { id: user.id, email: user.email, rol: user.rol },
                config.jwtSecret,
                { expiresIn: "1h" }
            )
            
            
            const RefreshToken = sign(
                { id: user.id },
                config.jwtSecret,
                { expiresIn: "1d" }
            )

            user.refreshToken = RefreshToken;
            res.end(JSON.stringify({ accessToken, refreshToken: RefreshToken }));
            return;
       
    }

    if(url === '/auth/logout' && method === HttpMethod.POST) {
       
        const token = req.headers["authorization"]?.split(" ")[1];

        if(token)
        {
            addRevokeToken(token);

            const formattedRequest = req as AuthenticatedRequest;

            if(
                formattedRequest.user &&
                typeof formattedRequest.user === "object" &&
                "id" in formattedRequest.user
            )
            {
               const result = removeUserToken(formattedRequest.user.email);

               if(!result)
               {
                res.statusCode = 403;   
                res.end(JSON.stringify({ message: "Internal server error" }));
                return;
               }
            }

            res.end(JSON.stringify({ message: "Logout successful" }));
            return;
        }
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: "endpoint Not found" }));
}