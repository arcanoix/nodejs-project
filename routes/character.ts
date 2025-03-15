import type { IncomingMessage, ServerResponse } from "http";
import { addCharacter, CharacterShema, deleteCharacter, getAllCharacters, getCharacterById, HttpMethod, Rol, updateCharacter, type Character } from "../models";
import { authenticateToken, type AuthenticatedRequest } from "../middleware/authentication";
import { authorizeRoles } from "../middleware/authorization";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";

export const characterRouter = async(req: IncomingMessage, res: ServerResponse) => {
    const {method, url} = req;

    if(!await authenticateToken(req as AuthenticatedRequest, res)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ message: "Unauthorized" }));
        return;
    }


    if(url === "/character" && method === HttpMethod.GET) {
        // Get all characters
        const characters = getAllCharacters();
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Get all characters" , characters}));
        return;
    }

    if(url === "/character/" && method === HttpMethod.GET) {
        // Get all characters
       const id = parseInt(url.split("/").pop() as string, 10);

       const character = getCharacterById(id);
        
       if(!character) {
              res.statusCode = 404;
              res.end(JSON.stringify({ message: "Character not found" }));
              return;
         }

        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Get one character" , character}));
        return;
    }

    if(url === "/character" && method === HttpMethod.POST) {
        // Create a character
        
        if(!await authorizeRoles(Rol.ADMIN, Rol.USER)(req as AuthenticatedRequest, res)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ message: "Forbidden" }));
            return;
        }

        const body = await parseBody(req);
        const result = safeParse(CharacterShema, body);

        if(result.issues)
        {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid body" }));
            return;
        }

        const character: Character = body;

        addCharacter(character);

        res.statusCode = 201;
        res.end(JSON.stringify({ message: "Create a character" }));
        return;
    }

    if(url?.startsWith("/character/") && method === HttpMethod.PATCH) {
    
        if(!await authorizeRoles(Rol.ADMIN, Rol.USER)(req as AuthenticatedRequest, res)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ message: "Forbidden" }));
            return;
        }

        const  id = parseInt(url.split("/").pop() as string, 10);
        const body = await parseBody(req);
        const character: Character = body;
        const updatedCharacter = updateCharacter(id, character);

        if(!updatedCharacter) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Character not found" }));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Update a character" }));
        return;
    }

    

    if(url?.startsWith("/character/") && method === HttpMethod.DELETE) {

        if(!await authorizeRoles(Rol.ADMIN)(req as AuthenticatedRequest, res)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ message: "Forbidden" }));
            return;
        }

        const  id = parseInt(url.split("/").pop() as string, 10);
        const success = deleteCharacter(id);
        
        if(!success) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Character not found" }));
            return;
        }
        
        // Delete a character
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Delete a character" }));
        return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: "endpoint Not found" }));
}
