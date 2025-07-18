import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
  const expiresInSecs = 3600; 
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: expiresInSecs } 
  );
  return { token, expiresInSecs };
};