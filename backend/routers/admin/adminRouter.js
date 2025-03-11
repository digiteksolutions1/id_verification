import { Router } from "express";
const adminRouter = Router();

adminRouter.get("/", (req, res) => {
  res.send("Admin Route");
});

export default adminRouter;
