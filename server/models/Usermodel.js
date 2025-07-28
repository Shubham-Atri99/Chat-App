import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs';

const useSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    pic:{
        type:String,
        required:true,
        default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
},
{timestamps:true})

useSchema.methods.matchpassword= async function(pass){
    return await bcrypt.compare(pass,this.password);
}

const User =mongoose.model("User",useSchema);
export default User;