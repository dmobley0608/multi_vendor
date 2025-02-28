import express from 'express';
import { login, logout, me, updatePassword } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const AuthRouter = express.Router();

AuthRouter.post('/login', login)
AuthRouter.get('/logout',authMiddleware,  logout)
AuthRouter.get('/me',authMiddleware, me)
AuthRouter.post('/me/update-password', authMiddleware, updatePassword)

export default AuthRouter ;