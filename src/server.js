import "dotenv/config";
import express from "express";
import cors from "cors";
import { studentRoute } from "./routes/studentRoute";
import { instructorRoute } from "./routes/instructorRoute";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import { authRoute } from "./routes/authRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auths", authRoute);

app.use("/api/students", studentRoute);

app.use("/api/instructors", instructorRoute);

app.use(errorHandlingMiddleware);


const PORT = process.env.APP_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
