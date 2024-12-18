import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";
import userRoute from "./routes/user-route";
import otpRoute from "./routes/otp-router";
import holdingRoute from "./routes/holding-router";
import tradeRoute from "./routes/trade-router";
import journalRoute from "./routes/journal-router";



const app = express();

//mongodb connection
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));
  

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


//routes
app.use("/api/users", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/holdings", holdingRoute);
app.use("/api/trades", tradeRoute);
app.use("/api/journals",journalRoute);


// /health end point
app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
  });

app.listen(8080, () => console.log("server started on localhost:8080"));
