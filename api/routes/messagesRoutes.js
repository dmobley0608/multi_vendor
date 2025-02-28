import express from 'express';
import {
    markAsRead,
    markAsSenderDeleted,
    markAsRecipientDeleted,
    createMessage,
    getUserMessages,
    editMessage,
    addReply,
    markReplyAsRead
} from '../controllers/message.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);


router.get('/my-messages', getUserMessages);
router.put('/:id', editMessage);
router.post('/:id/reply', addReply);
router.put('/:id/read', markAsRead);
router.put('/:id/sender-delete', markAsSenderDeleted);
router.put('/:id/recipient-delete', markAsRecipientDeleted);
router.put('/:id/reply/:replyId/read', markReplyAsRead)
router.post('/', createMessage);

export default router;
