import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import moment from "moment";
import { appConfig } from "../consts.js";
import { User } from "../models/user.model.js";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: appConfig.USER_EMAIL,
        pass: appConfig.USER_PASSWORD,
    },
});

const register = async (req, res) => {
    try {
        const validData = await Joi.object({
            fullname: Joi.string().trim().min(3).max(8).required(),
            email: Joi.string().email().trim().required(),
            password: Joi.string().trim().min(8).max(20).required(),
        }).validateAsync(req.body, { abortEarly: false });

        const existingUser = await User.findOne({ where: { email: validData.email } });
        if (existingUser) {
            return res.status(400).json({ message: `${validData.email} is already registered!` });
        }

        validData.password = await bcrypt.hash(validData.password, 10);

        const newUser = User.create(validData);
        await User.save(newUser);


        res.status(201).json(newUser);
    } catch (err) {
        if (err.isJoi) {
            return res.status(422).json({
                message: "Validation error!",
                errors: err.details.map(item => item.message),
            });
        }
        return res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const validData = await Joi.object({
            email: Joi.string().email().trim().required(),
            password: Joi.string().trim().min(8).max(20).required(),
        }).validateAsync(req.body, { abortEarly: false });

        const user = await User.findOne({ where: { email: validData.email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }

        const isValidPassword = await bcrypt.compare(validData.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }

        const jwtPayload = { sub: user.id };
        const token = jwt.sign(jwtPayload, appConfig.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: "1d",
        });

        res.json({ access_token: token });
    } catch (err) {
        if (err.isJoi) {
            return res.status(422).json({
                message: "Validation error!",
                errors: err.details.map(item => item.message),
            });
        }
        return res.status(500).json({ message: err.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const user = req.user;
        if (user.isVerifiedEmail) {
            return res.json({ message: "Email is already verified!" });
        }

        const randomCode = Math.floor(100000 + Math.random() * 900000);
        const codeExpiredAt = moment().add(appConfig.verifyCodeExpireMinutes, "minutes");

        user.code_expired_at = codeExpiredAt;
        user.verifyCode = randomCode;

        await User.save(user);

        const mailOptions = {
            from: appConfig.USER_EMAIL,
            to: user.email,
            subject: "Email Verification",
            text: `Your verification code is: ${randomCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }
            res.json({
                message: `Verification code sent to your email. It will expire in ${appConfig.verifyCodeExpireMinutes} minutes.`,
            });
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const checkEmailCode = async (req, res) => {
    try {
        const validData = await Joi.object({
            code: Joi.string().length(6).regex(/^[0-9]+$/).required(),
        }).validateAsync(req.body, { abortEarly: false });

        const user = req.user;
        if (!user.verifyCode) {
            return res.status(400).json({ message: "Verification code not found!" });
        }

        if (moment(user.code_expired_at).isBefore(moment())) {
            return res.status(400).json({ message: "Verification code has expired!" });
        }

        if (user.verifyCode !== Number(validData.code)) {
            return res.status(400).json({ message: "Invalid verification code!" });
        }

        user.isVerifiedEmail = true;
        user.verifyCode = null;
        user.code_expired_at = null;

        await User.save(user);
        res.json({ message: "Email verified successfully!" });
    } catch (err) {
        if (err.isJoi) {
            return res.status(422).json({
                message: "Validation error!",
                errors: err.details.map(item => item.message),
            });
        }
        return res.status(500).json({ message: err.message });
    }
};

export const userController = {
    register,
    login,
    verifyEmail,
    checkEmailCode,
};
