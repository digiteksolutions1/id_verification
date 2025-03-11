import { Router } from "express";
import clientRouter from './client/clientRouter.js';
import adminRouter from './admin/adminRouter.js';

const routerBranching = Router();

routerBranching.use('/admin', adminRouter);
routerBranching.use('/client', clientRouter);

export default routerBranching;
