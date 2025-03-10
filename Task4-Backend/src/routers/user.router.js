import { Router } from "express";
import { userController } from "../controller/user.controller.js";

export const userRouter = Router();
const controller = userController;

userRouter.post('/register' , controller.register)
userRouter.post('/login' , controller.login)
userRouter.post('/verifyEmail' , controller.verifyEmail)
userRouter.post('/verifyEmailCheck' , controller.checkEmailCode)
