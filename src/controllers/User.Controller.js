import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";

const registeruser = asynchandler(async (req, res) => {

   const { fullname,username,email,password } = req.body
   
   if (fullname == "" || username == "" || email == "" || password == "") {
        throw new ApiError(400,"Please Fill All Required Field")
   }

   const Exist = User.findOne({email});

   if (Exist) {
    throw new ApiError(409,"User Already Exist");
   }

   


   

   
});

export {registeruser}