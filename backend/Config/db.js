import mongoose from "mongoose";
const connectdb = async () => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected URL ${process.env.MONGO_URI}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
export default connectdb;
