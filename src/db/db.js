import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected");
    } catch (error) {
        console.log("Connection Failed",error);   
    }
}

export default connectDB;