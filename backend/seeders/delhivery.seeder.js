
import 'dotenv/config.js';
import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import WarehouseLocation from "../Models/WarehouseLocation.js";

const seedDelhivery = async () => {
  console.log("Starting Warehouse Location seeder...");
  await connectDB();
  console.log("Database connected.");

  try {
    // Check if a default location already exists
    const existing = await WarehouseLocation.findOne({ default: true });
    console.log("Existing default warehouse:", existing);
    if (existing) {
      console.log("Default warehouse location already exists.");
      return;
    }

    // Create a default warehouse location
    console.log("Creating default warehouse location...");
    await WarehouseLocation.create({
      name: "Default Warehouse",
      phone: "9876543210",
      pincode: "110037",
      line1: "123, Industrial Area",
      line2: "Okhla Phase III",
      city: "New Delhi",
      state: "Delhi",
      default: true,
    });

    console.log("Warehouse seeder executed successfully: Default warehouse added.");
  } catch (error) {
    console.error("Error seeding Warehouse data:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedDelhivery();
