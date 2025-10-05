
import jwt from "jsonwebtoken";
export default function auth(required = true) {
  return (req, res, next) => {
    const bearer = req.headers.authorization || "";
    const token = bearer.startsWith("Bearer ")
      ? bearer.slice(7)
      : req.cookies?.accessToken || null;
    if (!token) {
      if (required) return res.status(401).json({ error: "Unauthorized" });
      req.user = null;
      return next();
    }
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      if (required) return res.status(401).json({ error: "Invalid token" });
      req.user = null;
      next();
    }
  };
}
