import { StatusCodes } from "http-status-codes";
import { db } from "~/config/firebase";
import { ApiError, ApiResponse } from "~/utils/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const studentsRef = db.ref("students");

const getMyLessons = async (req, res, next) => {
  try {
    const { id } = req.query;

    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing studentId");
    }

    const studentRef = studentsRef.child(id);
    const snapshot = await studentRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
    }

    const studentData = snapshot.val();
    const lessons = studentData.lessons || {};

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, "Get my lessons successfully", lessons)
      );
  } catch (error) {
    next(error);
  }
};

const markLessonDone = async (req, res, next) => {
  try {
    const { studentId, lessonId } = req.body;

    if (!studentId || !lessonId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing studentId or lessonId"
      );
    }

    const lessonRef = studentsRef.child(`${studentId}/lessons/${lessonId}`);
    const snapshot = await lessonRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found");
    }

    await lessonRef.update({ isCompleted: true });

    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Make lesson done successfully"));
  } catch (error) {
    next(error);
  }
};

const setupAccount = async (req, res, next) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing token, name, or password"
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.userId;

    const studentRef = studentsRef.child(studentId);
    const snapshot = await studentRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await studentRef.update({
      name,
      password: hashedPassword,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Account setup successfully"));
  } catch (error) {
    next(error);
  }
};

export const studentController = { getMyLessons, markLessonDone, setupAccount };
