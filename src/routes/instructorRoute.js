import express from "express";
import { instructorController } from "~/controllers/instructorController";
const router = express.Router();

// Students
router.post("/addStudent", instructorController.addStudent);
router.post("/assignLesson", instructorController.assignLesson);
router.get("/students", instructorController.getStudents);
router.get("/student/:phone", instructorController.getStudentByPhone);
router.put("/editStudent/:id", instructorController.updateStudent);
router.delete("/student/:id", instructorController.deleteStudent);

// Lessons
router.post("/addLesson", instructorController.addLesson);
router.get("/lessons", instructorController.getLessons);


export const instructorRoute = router;
