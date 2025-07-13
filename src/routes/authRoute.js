import express from "express";
import { authController } from "~/controllers/authController";
const router = express.Router();

router.post("/instructorRegister", authController.instructorRegister);
router.post("/createAccessCode", authController.createAccessCode);
router.post("/validateAccessCode", authController.validateAccessCode);
router.post("/studentLogin", authController.studentLogin);
router.get("/logout", authController.logout);


export const authRoute = router;
