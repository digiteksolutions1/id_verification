import express from "express";
import { routerBranching } from './routers/routeBranching.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/digitek-solutions', routerBranching);

app.listen(port, ()=>{
    console.log(`Server running on port:${port}`);
});
