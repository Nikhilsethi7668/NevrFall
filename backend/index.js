import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./Config/Db.js";
import authRoutes from "./Routes/auth.routes.js";

const app = express();
app.set("trust proxy", 1);

const isProd = process.env.PRODUCTION === "true";
app.use(
  cors({
    origin: isProd ? process.env.CLIENT_URL : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/health", (req, res) =>
  res.json({
    ok: true,
    env: isProd ? "prod" : "dev",
    time: new Date().toISOString(),
  })
);

app.use("/auth", authRoutes);
// app.use("/products", productRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || "Server error" });
});

const PORT = Number(process.env.PORT || 8080);

(async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server started on PORT ${PORT}`);
    });

    const shutdown = (sig) => () => {
      console.log(`${sig} received. Shutting down...`);
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", shutdown("SIGINT"));
    process.on("SIGTERM", shutdown("SIGTERM"));
  } catch (e) {
    console.error("Startup error:", e);
    process.exit(1);
  }
})();
