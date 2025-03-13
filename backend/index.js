import express from "express";
import connectDB from "./db.js";
import routerBranching from './routers/routeBranching.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/digital-accountant', routerBranching);

app.listen(port, () => {
    console.log(`Server running on port:${port}`);
    connectDB();
});
