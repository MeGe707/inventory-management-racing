import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, email, role) => {
    const token = jwt.sign({userId, email, role}, process.env.JWT_SECRET, {
        expiresIn: "30d",
    })  

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000 

    })

    return token;
}
