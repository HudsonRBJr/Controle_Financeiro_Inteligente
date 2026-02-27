/// <reference path="./types/swagger-ui-express.d.ts" />
import path from "path";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes";
import recurringTransactionRoutes from "./routes/recurring-transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import installmentRoutes from "./routes/installment.routes";
import authRoutes from "./routes/auth.routes";
import experimentRoutes from "./routes/experiment.routes";
import metricsRoutes from "./routes/metrics.routes";
import accountRoutes from "./routes/account.routes";
import creditCardRoutes from "./routes/credit-card.routes";
import configurationRoutes from "./routes/configuration.routes";
import { swaggerDocument } from "./swagger";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/recurring-transactions", recurringTransactionRoutes);
app.use("/budgets", budgetRoutes);
app.use("/accounts", accountRoutes);
app.use("/credit-cards", creditCardRoutes);
app.use("/configurations", configurationRoutes);
app.use("/installments", installmentRoutes);
app.use("/experiments", experimentRoutes);
app.use("/metrics", metricsRoutes);

// Swagger UI em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Documentação HTML (arquivo separado em public/documentacao.html)
app.get("/documentacao", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "documentacao.html"));
});

app.use("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/hello", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});
