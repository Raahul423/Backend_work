import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import Jwt from "jsonwebtoken";

const verifyJWT = asynchandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1]; 
    // yaha se mujhe user se token milegaa 

  if (!token) {
    throw new ApiError(401, "Token not Found");
  } 
  // ager user ka token galat hai ya mujhe token nhi mila to yeh code chalega

  const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN); 
  // yha pr backend token ko verify karega with the help of secret key 

  const user = await User.findById(decoded?._id);
   // verify hone ke baad vo ush token se user ko fine karega ki kon sa user hai db main kyuki generate krte samah maine accesstoken main id or kuch information store kari this to vo uski ki help se id main se user ko find karega 

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  // ager user nhi milta hai to simple bool do tum unauthorize ho 
  req.user = user;
  //ager mil jata hai user to  req.user ke ander ush user ke bhej do 
  next();
});

export { verifyJWT };
