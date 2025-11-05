import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import fileupload from "../utils/Cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  return {accessToken,refreshToken}

};

const registeruser = asynchandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (fullname == "" || username == "" || email == "" || password == "") {
    throw new ApiError(400, "Please Fill All Required Field");
  }

  const Exist = await User.findOne({ email });

  if (Exist) {
    throw new ApiError(409, "User Already Exist");
  }

  const localavatar = req.files?.avatar[0]?.path;
  const localcoverImage = req.files?.coverImage?.[0]?.path || "";

  if (!localavatar) {
    throw new ApiError(400, "Fill is required field");
  }

  const avatar = await fileupload(localavatar);
  const coverImage = await fileupload(localcoverImage);

  if (!avatar) {
    throw new ApiError(400, "Fill this required field");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  console.log(avatar);
  console.log(coverImage);

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, createduser, "User Registered Successfully"));
});

const LoginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body; // Take data from User

  if (!username || !email) {
    throw new ApiError(400, "uername or email is required");
  } // check user fill one of them field

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }); // Find user from database

  if (!user) {
    throw new ApiError(404, "User not Registered");
  }

  const passwordcheck = await user.ispasswordcorrect(password);

  if (!passwordcheck) {
    throw new ApiError(400, "Password is incorrect");
  }


  await generateAccessAndRefreshToken(user._id)




});

export { registeruser };
