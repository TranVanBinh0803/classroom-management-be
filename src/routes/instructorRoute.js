import express from "express";
import { instructorController } from "~/controllers/instructorController";
const router = express.Router();

router.post("/addStudent", instructorController.addStudent);
router.post("/assignLesson/:id", instructorController.assignLesson);
router.get("/students", instructorController.getStudents);
router.get("/student/:phone", instructorController.getStudentByPhone);
router.put("/editStudent/:id", instructorController.updateStudent);
router.delete("/student/:id", instructorController.deleteStudent);

export const instructorRoute = router;
