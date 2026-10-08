const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({
                message: "Acess denied. No token provied."

            });
        }
        
    const [scheme, token] = authHeader.split(" ");

    if(scheme !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Access denied. Invalid token format."
        });
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("_id role isActive");

    if (!user || user.isActive === false) {
        return res.status(401).json({
            message: "Your session is no longer active"
        });
    }

    req.user = {
        id: user._id.toString(),
        role: user.role
    };

    next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

};
    
module.exports = authMiddleware;

