import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, defaulxt: "" },
    image: { type: String, default: "" },
    meta: {
      type: String,
      default: ""
    },
    isActive:{
        type:String , enum:["yes" , "no"]
    },
    priority:{
        type:String , enum:["high" , "moderate" , "low"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Collection", CollectionSchema);
