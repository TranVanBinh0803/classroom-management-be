import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "~/utils/types";

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Missing or malformed token");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const instructorAuthorization = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== "instructor") {
      throw new ApiError(StatusCodes.FORBIDDEN, "Instructor access only");
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const studentAuthorization = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== "student") {
      throw new ApiError(StatusCodes.FORBIDDEN, "Student access only");
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const allAuthorization = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};