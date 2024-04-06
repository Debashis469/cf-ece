import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    user_name: {
        type: String
    }, 
    roll: {
        type : String,
        unique : true
    },
    handle: {
        type : String,
        unique : true
    }
}) ;


export const User = mongoose.model('User', UserSchema) ;
