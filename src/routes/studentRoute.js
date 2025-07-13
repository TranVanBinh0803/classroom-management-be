import express from "express";
import { studentController } from "~/controllers/studentController";
const router = express.Router();

router.get("/myLessons", studentController.getMyLessons);
router.post("/markLessonDone", studentController.markLessonDone);
router.post("/setupAccount", studentController.setupAccount);

// router.put("/editProfile", studentController.editProfile);


export const studentRoute = router;
