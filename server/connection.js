import mongoose, { connect } from "mongoose";

const connectMongo= async(url)=>{
    await mongoose.connect(url);
}

export default connectMongo;