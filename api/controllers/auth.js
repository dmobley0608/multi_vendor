import { Session, User } from "../models/index.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        let session = await Session.findOne({ where: { userId: user.id } });

        if (!session) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7 days' });
            session = await Session.create({ userId: user.id, token });
        } else {
            session.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7 days' });
            await session.save();
        }
        const safeUser = { id: user.id, username: user.username, email: user.email, isStaff: user.isStaff };
        res.json({ message: 'Login successful', user: safeUser, token: session.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        const { userId } = req;
        await Session.destroy({ where: { userId } });
        return res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout', error: error.message });
    }
}

export const me = async (req, res) => {
    try {
        const { userId } = req;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const safeUser = { id: user.id, username: user.username, email: user.email, isStaff: user.isStaff };
        return res.json({ ...safeUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching user data', error: error.message });
    }
}



export const createStaffAccount = async (req, res) => {
    try {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        const user = await User.create({ username,  password, isStaff: true });
        return true;
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating staff account', error: error.message });
        return false;
    }
}

export const updatePassword = async (req, res) => {
    try {
        const { userId } = req;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating password', error: error.message });
    }
}


