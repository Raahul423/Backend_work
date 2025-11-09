import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import fileupload from "../utils/Cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
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

// User Login Logic

const LoginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body; // Take data from User

  if (!username && !email) {
    throw new ApiError(400, "uername or email is required");
  } // check user fill one of them field

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }); // Find user from database

  if (!user) {
    throw new ApiError(400, "User not Registered");
  } // if user not find in db then

  const passwordcheck = await user.ispasswordcorrect(password); // check password by db and user enter password

  if (!passwordcheck) {
    throw new ApiError(400, "Password is incorrect");
  } // if password not match or empty data then send this message

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  ); // generate accesstoken or refreshtoken by with the help og userid

  const options = {
    httpOnly: true,
    secure: true,
  }; // option store in user cookie

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        { user: user, accessToken, refreshToken },
        "User Successfully logged in"
      )
    );
});

// User LogOut Logic

const LogoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: undefined },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User Logged Out"));
});




//User Add New RefreshToken when Accesstoken Expire then renew token

const accessandrefreshToken = asynchandler(async (req, res) => {

  const incomingRefreshToken=req.cookie?.refreshToken || req.body.refreshToken;
  // when i was find the refresh token from user cookie

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Invalid Token");
    //check whether refrehToken found in user cookie or not
  }

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN);

  const user = await User.findById(decoded?._id);

  if(!user){
    throw new ApiError(401,"Token not valid");
  }

  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"refresh and accessToken are expired")
  }

  const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id);

  const option = {
    httpOnly:true,
    secure:true
  }

  res.status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",newrefreshToken)
  .res(
    new Apiresponse(
      200,
      {accessToken,newrefreshToken},
      "Accesstoken refreshed"
    )
  )

});

export { registeruser, LoginUser, LogoutUser, accessandrefreshToken };
