
import { Session, User } from "../models/index.js";
import jwt from 'jsonwebtoken';

const refreshToken = async (req, res, next) => {
    const { userId } = req;
    const session = await Session.findOne({ where: { userId } });
    if (!session) {
        return res.status(400).json({ message: 'Invalid session' });
    }
    session.token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7 days' });
    await session.save();
    next();
}

export const authMiddleware = async (req, res, next) => {
    try {

        const sessionToken = req.headers.authorization.split(' ')[1];


        const session = await Session.findOne({ where: { id: sessionToken } });
        if (!session) {
            return res.status(401).json({ message: 'Not Authorized' });
        }
        const token = session.token;
        if (!token) {
            return res.status(401).json({ message: 'Not Authorized' });
        }
        const isExpired = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return true;
            }
            req.userId = decoded.id;
            return false;

        });
        if (isExpired) {
            return res.status(401).json({ message: 'Not Authorized' });
        }
        refreshToken(req, res, next);
    } catch (error) {
        return res.status(401).json({ message: 'Not Authorized' });
    }

}

export const isStaff = async (req, res, next) => {
    const { userId } = req;
    const user = await User.findByPk(userId);
    if (!user.isStaff) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    next();
}
