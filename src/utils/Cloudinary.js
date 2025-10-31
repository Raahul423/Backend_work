import dotenv from "dotenv";
dotenv.config(); 
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileupload = async (localfile) => {
  try {
    if (!localfile) return null;
    const result = await cloudinary.uploader.upload(localfile, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully:", result.url);
    fs.unlinkSync(localfile);
    return result;
  } catch (error) {
    console.log("Cloudinary upload in error:",error.message);
    fs.unlinkSync(localfile);
    return null;
  }
};

export default fileupload;
