import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, email, role) => {
   const token = jwt.sign(
  { id: userId.toString(), email, role },
  process.env.JWT_SECRET,
  { expiresIn: "30d" }
);


  res.cookie("token", token, {
  httpOnly: true,
  secure: true,          // production’da zorunlu
  sameSite: "none",      // 🔥 EN KRİTİK
  maxAge: 30 * 24 * 60 * 60 * 1000
});
}
