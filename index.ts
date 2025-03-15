import cors from "cors"
import http from "http"
import { authRouter, characterRouter } from "./routes";
import config from "./config";

const corsMiddleware = cors()

const server = http.createServer(async (req, res) => {
  corsMiddleware(req, res, async () => {
    // Your request handling logic here
    res.setHeader("Content-Type", "application/json")

    try{
        if(req.url?.startsWith("/auth"))
        {
            await authRouter(req, res)
        }else if(req.url?.startsWith("/character")){
            await characterRouter(req, res)

        }else{
            res.statusCode = 404
            res.end(JSON.stringify({ message: "Not Found" }))
        }
    }catch(_err)
    {
        res.statusCode = 500
        res.end(JSON.stringify({ message: "Internal Server Error" }))
    }
  });
});


server.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}/`);
});