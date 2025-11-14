import jwt from "jsonwebtoken";

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // yetkisi yoksa
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Unauthorized: You are not allowed to access this route" });
      }

      // kullanıcı bilgisini req'e yaz
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (err) {
      console.error("Role check failed:", err.message);
      res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};
