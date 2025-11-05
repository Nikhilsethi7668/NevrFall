import mongoose from "mongoose";

const WarehouseLocationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  pincode: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  default: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const WarehouseLocation = mongoose.model(
  "WarehouseLocation",
  WarehouseLocationSchema
);

export default WarehouseLocation;
