import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
    await mongoose.connect(mongoUri);
    console.log("MongoDB conectado");
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
};
