import express from 'express';
import router from "./routes";

function createServer() {
    const app = express();
    app.use(express.json());

    app.use(router)

    return app;
}

export default createServer;