import express from "express";
import { studentController } from "~/controllers/studentController";
import { studentAuthorization } from "~/middlewares/authMiddleware";
const router = express.Router();

router.get("/myLessons", studentAuthorization, studentController.getMyLessons);
router.post(
  "/markLessonDone",
  studentAuthorization,
  studentAuthorization,
  studentController.markLessonDone
);
router.post(
  "/setupAccount",
  studentController.setupAccount
);

// router.put("/editProfile", studentController.editProfile);

export const studentRoute = router;
