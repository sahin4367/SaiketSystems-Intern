import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    fullname : {
        type : String,
        trim : true,
        required : true
    },
    email : {
        type : String,
        trim : true,
        required : true,
        unique  : true
    },
    password : {
        type : String,
        trim : true,
        required : true
    },
    isVerifiedEmail: {
        type: Boolean,
    },
    code_expired_at: {
        type: Date,
    },
    verifyCode: {
        type: Number,
    }
})
export const User = mongoose.model("User" , userSchema)