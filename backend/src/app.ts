import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

app.use("/health", (req, res) => {
    res.status(200).json({ message: "OK" });
});

app.use(("/hello"), (req, res) => {
    res.status(200).json({ message: "Hello World" });
});
