import express from "express";
import 'dotenv/config'
import chatrouter from "./routes/chatsroute.js";
import connectMongo from "./connection.js";
import userrouter from "./routes/userRoute.js";
const app= express();
const port = process.env.PORT||3059;


//db connection 
connectMongo("mongodb://localhost:27017/fullStack2")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

//middleware
app.use(express.json());

//routes 
app.get("/" , (req,res)=>{
    res.send("api started")
})

app.use("/api/chat",chatrouter)
app.use("/api/user",userrouter)

app.listen(port,()=> console.log(`server started at ${port}`));

