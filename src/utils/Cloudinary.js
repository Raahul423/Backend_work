import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs, { unlink, unlinkSync } from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET_KEY
});


const fileupload = async (localfile)=>{
    try {
        if(!localfile) return null
        const value = await cloudinary.uploader.upload(localfile,{
            resource_type:"auto"
        })
        console.log("File uploaeded Successfully",value.url);
        return value;
    } catch (error) {
        fs.unlinkSync(localfile)
        return null
    }
}

export default fileupload