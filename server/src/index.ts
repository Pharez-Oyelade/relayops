import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `RelayOps Server running in ${env.NODE_ENV} mode on port ${env.PORT}`,
    );
  });

  const shutdown = async (signal: string) => {
    console.log(
      `\n${signal} received. Closing HTTP server and MongoDB connection...`,
    );
    server.close(async () => {
      await mongoose.connection.close();
      console.log("Graceful shutdown complete.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();
