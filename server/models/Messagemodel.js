import mongoose, { mongo, Schema } from "mongoose";

const Messagemodel= new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,ref:"User"
    },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    },
    

},{
    timestamps:true,
})