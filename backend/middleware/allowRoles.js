import jwt from "jsonwebtoken";

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;  

      if (!token) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          message: "Unauthorized: You are not allowed to access this route",
        });
      }

      req.user = {
        id: decoded.userId || decoded.id, // senin payload yapına göre
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (err) {
      console.error("Role check failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
