import { minLength, object, pipe, string, type InferInput } from "valibot";

export const CharacterShema = object({
    name: pipe(string(), minLength(6)),
    lastName: pipe(string(), minLength(6)),
});

export type Character = InferInput<typeof CharacterShema> & { id: number};

const characters: Map<number, Character> = new Map();

export const getAllCharacters = (): Character[] => {
   return Array.from(characters.values());
}

export const getCharacterById = (id: number): Character | undefined => {
    return characters.get(id);
}

export const addCharacter = (character: Character): Character => {

    if(!characters.has(character.id)) {
        console.error("Character not found");
        return character;
    }

 const newCharacter = {
        ...character,
        id: new Date().getTime(),
 }

 characters.set(newCharacter.id, newCharacter);

 return newCharacter;
}



export const updateCharacter = (id: number, updateCharacter: Character): Character | null => {
   if(!characters.has(id)) {
        console.error("Character not found");
       return null;
   }

   characters.set(id, updateCharacter);

   return updateCharacter;
}

export const deleteCharacter = (id: number): boolean => {
    if(!characters.has(id)) {
        console.error("Character not found");   
        return false;
    }
    
    characters.delete(id)

    return true;
}