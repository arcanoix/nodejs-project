import type { ServerResponse } from "http";
import type { AuthenticatedRequest } from "./authentication";
import type { User } from "../models";

export const authorizeRoles = (...roles: string[]) => { 
    return async(req: AuthenticatedRequest, res: ServerResponse): Promise<boolean> => { 
        const userRole = (req.user as User).rol;

        if (!userRole || !roles.includes(userRole)) { 
            res.statusCode = 403; 
            res.end(JSON.stringify({ message: "Forbidden" })); 
            return false; 
        }

        return true;
    }
}