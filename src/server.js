import dotenv from 'dotenv'
dotenv.config();
import connectDB from './DataBase/db.js'
import { app } from './app.js';


connectDB();
app.listen(process.env.PORT,()=>{
    console.log("Server is running on PORT",process.env.PORT);
    
})



