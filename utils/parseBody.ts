import type { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
        const decoder = new StringDecoder("utf-8");
        let buffer = "";

        req.on("data", (chunck) => {
            buffer += decoder.write(chunck);
        })

        req.on("end", () => {
            buffer += decoder.end();
          
            try {
                resolve(JSON.parse(buffer));
            } catch (_error) {
                reject("Invalid JSON");
            }
        })
    })
}