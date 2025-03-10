import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import 'dotenv/config'
import { appConfig } from './src/consts.js';
import { appRouter } from './src/routers/index.js';

dotenv.config();
const app = express()
app.use(express.json())

mongoose.connect(appConfig.MONGO_URL)
.then(() => console.log("Connected to databease successfully!"))
.catch(err => console.log("Database connection FAILED!", err))


app.use('/api', appRouter);


app.listen(appConfig.PORT, () => {
    console.log(`Server is running - ${appConfig.PORT}`);
})