import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { appConfig } from '../consts.js';
import 'dotenv/config';

export const useAuth = async (req, res, next) => {
    console.log("useAuth middleware ");  
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: `Token not found~!`
        });
    }

    const access_token = req.headers.authorization.split(" ")[1];
    if (!access_token) return res.status(401).json({
        message: `Token not found!`
    });

    try {
        const jwtResult = jwt.verify(access_token, appConfig.JWT_SECRET );

        const user = await User.findById(jwtResult.sub).select("_id email fullname");
        if (!user) return res.status(401).json({ message: `User not found..` });

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error,
        });
    }
};