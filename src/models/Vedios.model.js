import mongoose from "mongoose";

const vedioSchema = new mongoose.Schema(
    {
     vedioFile:{
        type:String,
        required:true,
     },
     thumbnail:{
        type:String,
        required:true
     },
     title:{
        type:String,
        required:true
     },
     description:{
        type:String,
        required:true
     },
     duration:{
        type:Number, //cloudnary url
        required:true
     },
     veiw:{
        type:number,
        default:0
     },
     is_Published:{
        type:Boolean,
        default:true
     },
     owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
     },
},{
    timestamps:true
})

export const Vedio = mongoose.model("Vedio",vedioSchema)