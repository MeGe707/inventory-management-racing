import express from "express";
import connectDB from "./config/mongoDB.js";
import "dotenv/config";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
import adminRouter from "./routes/adminRouter.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://inventory-management-racing-j2he.onrender.com",
    ],
    credentials: true,
  })
);



app.use("/user", userRouter);

app.get("/", (req, res) => res.status(200).send("API Working"));
app.use("/admin", adminRouter);

app.listen(port, () => console.log(`Server is running on port: ${port}`));
