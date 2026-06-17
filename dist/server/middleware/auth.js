import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({
            error: "No token",
        });
    const token = auth.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ||
            "mineguard_secret");
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({
            error: "Invalid token",
        });
    }
};
