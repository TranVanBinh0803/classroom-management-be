import express from "express";
import { instructorController } from "~/controllers/instructorController";
import { instructorAuthorization } from "~/middlewares/authMiddleware";
const router = express.Router();

// Students
router.post(
  "/addStudent",
  instructorAuthorization,
  instructorController.addStudent
);
router.post(
  "/assignLesson",
  instructorAuthorization,
  instructorController.assignLesson
);
router.get(
  "/students",
  instructorAuthorization,
  instructorController.getStudents
);
router.get(
  "/student/:phone",
  instructorAuthorization,
  instructorController.getStudentByPhone
);
router.put(
  "/editStudent/:id",
  instructorAuthorization,
  instructorController.updateStudent
);
router.delete(
  "/student/:id",
  instructorAuthorization,
  instructorController.deleteStudent
);

// Lessons
router.post(
  "/addLesson",
  instructorAuthorization,
  instructorController.addLesson
);
router.get(
  "/lessons",
  instructorAuthorization,
  instructorController.getLessons
);

export const instructorRoute = router;
