"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ ok: false, message: 'No autorizado' });
    }
    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ ok: false, message: 'No autorizado' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(401).json({ ok: false, message: 'No autorizado' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            usuarioId: decoded.usuarioId,
            negocioId: decoded.negocioId,
            rol: decoded.rol,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ ok: false, message: 'No autorizado' });
    }
};
exports.authMiddleware = authMiddleware;
