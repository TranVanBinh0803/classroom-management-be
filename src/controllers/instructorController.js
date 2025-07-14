import { StatusCodes } from "http-status-codes";
import { db } from "~/config/firebase";
import { ApiError, ApiResponse } from "~/utils/types";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "~/utils/generateToken";
import { sendVerificationEmail } from "~/utils/emailUntils";

const studentsRef = db.ref("students");
const lessonsRef = db.ref("lessons");

const addStudent = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone || !email || !address) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }

    const snapshot = await studentsRef.once("value");
    const studentsData = snapshot.val();

    const isPhoneExists =
      studentsData &&
      Object.values(studentsData).some((student) => student.phone === phone);

    if (isPhoneExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Student with this phone already exists"
      );
    }

    const id = uuidv4();
    const studentData = {
      id,
      name,
      phone,
      email,
      address,
      role: "student",
      avatar: "",
    };

    await studentsRef.child(id).set(studentData);

    const token = generateToken(id);
    await sendVerificationEmail(email, token);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          "Student created and email sent",
          studentData
        )
      );
  } catch (error) {
    next(error);
  }
};

const assignLesson = async (req, res, next) => {
  try {
    const { studentId, lessonId, title, description } = req.body;

    if (!studentId || !lessonId || !title || !description) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }

    const studentRef = studentsRef.child(studentId);
    const snapshot = await studentRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
    }

    const lessonRef = studentRef.child("lessons").child(lessonId);

    await lessonRef.set({
      id: lessonId,
      title,
      description,
      isCompleted: false,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(StatusCodes.CREATED, "Lesson assigned successfully")
      );
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const snapshot = await studentsRef.once("value");
    const students = snapshot.val() || {};
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const getStudentByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Phone number is required");
    }

    const snapshot = await studentsRef.once("value");
    const studentsData = snapshot.val();
    const student = Object.values(studentsData).find((s) => s.phone === phone);

    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
    }

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Get student by phone successfully",
          student
        )
      );
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const studentRef = studentsRef.child(id);
    const snapshot = await studentRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    await studentRef.update(updateData);

    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Student updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentRef = studentsRef.child(id);

    const snapshot = await studentRef.once("value");
    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    await studentRef.remove();

    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Student deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const addLesson = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }

    const id = uuidv4();
    const lessonData = {
      id,
      title,
      description,
    };
    await lessonsRef.child(id).set(lessonData);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          "Student created successfully",
          lessonData
        )
      );
  } catch (error) {
    next(error);
  }
};

const getLessons = async (req, res, next) => {
  try {
    const snapshot = await lessonsRef.once("value");
    const lessons = snapshot.val() || {};
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

export const instructorController = {
  addStudent,
  assignLesson,
  getStudents,
  getStudentByPhone,
  updateStudent,
  deleteStudent,

  addLesson,
  getLessons,
};
