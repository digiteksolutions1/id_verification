import { Router } from "express";
const clientRouter = Router();

clientRouter.get("/", (req, res) => {
  res.send("Client Route");
});

export default clientRouter;
