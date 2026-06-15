import mongoose from "mongoose";
import { config } from "../config.js";

export async function connectMongo() {
  mongoose.connection.on("error", (err) => {
    console.error("[mongo] connection error:", err);
  });

  await mongoose.connect(config.mongoUri);
  console.log("[mongo] connected");
}
