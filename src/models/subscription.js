import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscription:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);