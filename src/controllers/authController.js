import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { generateOtp } from "~/utils/generateOTP";
import { ApiError, ApiResponse } from "~/utils/types";
import axios from "axios";
import { db } from "~/config/firebase";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "~/utils/generateToken";
import { normalizePhoneNumber } from "~/utils/helpers";

const instructorsRef = db.ref("instructors");

const instructorRegister = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing phone number");
    }

    const snapshot = await instructorsRef.once("value");
    const instructorsData = snapshot.val();

    const isPhoneExists =
      instructorsData &&
      Object.values(instructorsData).some(
        (instructor) => instructor.phone === phone
      );

    if (isPhoneExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Instructor with this phone already exists"
      );
    }

    const id = uuidv4();
    const instructorData = {
      id,
      phone,
    };

    await instructorsRef.child(id).set(instructorData);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          "Instructor created successfully",
          instructorData
        )
      );
  } catch (error) {
    next(error);
  }
};

const createAccessCode = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = generateOtp();
    console.log("otp:", otp);

    if (!phone) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing phone number");
    }

    // const response = await axios.post(
    //   "https://api.sms.to/sms/send",
    //   {
    //     to: phone,
    //     message: `Your OTP is: ${otp}`,
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.SMS_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    // if (response.status === StatusCodes.OK) {
    //   const otpRef = db.ref("otps").child(phone);
    //   await otpRef.set({
    //     code: otp,
    //     createdAt: Date.now(),
    //   });
    //   return res
    //     .status(StatusCodes.OK)
    //     .json(new ApiResponse(StatusCodes.OK, "OTP sent successfully"));
    // }
    const otpRef = db.ref("otps").child(phone);
    await otpRef.set({
      code: otp,
      createdAt: Date.now(),
    });
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "OTP sent successfully"));
  } catch (error) {
    next(error);
  }
};

const validateAccessCode = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing phone or otp");
    }

    const otpRef = db.ref("otps").child(phone);
    const snapshot = await otpRef.once("value");

    if (!snapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "OTP not found");
    }

    const data = snapshot.val();
    if (data.code !== otp) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access code");
    }

    const instructorSnapshot = await instructorsRef.once("value");
    const instructorsData = instructorSnapshot.val();

    let instructorData;
    let id;

    const existingEntry = instructorsData
      ? Object.entries(instructorsData).find(
          ([_, instructor]) => instructor.phone === normalizePhoneNumber(phone)
        )
      : null;
    console.log("existingEntry:", existingEntry);

    if (existingEntry) {
      const [existingId, existingInstructor] = existingEntry;
      id = existingId;
      instructorData = existingInstructor;
    } else {
      id = uuidv4();
      instructorData = {
        id,
        phone: normalizePhoneNumber(phone),
        email: "",
        avatar: "",
      };
      await instructorsRef.child(id).set(instructorData);
    }

    const { token: accessToken, expiresInSecs } = generateToken(id);

    const returnData = {
      accessToken,
      expiresInSecs,
      user: instructorData,
    };

    await otpRef.remove();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Access code validated successfully",
          returnData
        )
      );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Logout successfully"));
  } catch (error) {
    next(error);
  }
};

export const authController = {
  instructorRegister,
  createAccessCode,
  validateAccessCode,
  logout,
};
