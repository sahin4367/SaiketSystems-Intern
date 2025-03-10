import { Router } from "express";
import { userRouter } from "./user.router.js";

export const appRouter = Router();

appRouter.use('/users' , userRouter )