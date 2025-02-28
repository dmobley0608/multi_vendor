import { Message, User, Reply } from '../models/index.js';
import { Op } from 'sequelize';

// Create new message
export const createMessage = async (req, res) => {
    try {
        const { body, subject, recipients } = req.body;
        const sender = await User.findByPk(req.userId);

        let recipientList = [];
        // If user is not staff, send to all staff users
        if (!sender.isStaff) {
            recipientList = await User.findAll({
                where: { isStaff: true }
            });
        } else {
            recipientList = recipients
            // For staff users, use provided recipient list
            if (!recipients || !Array.isArray(recipients)) {
                return res.status(400).json({ message: 'Recipients array is required for staff messages' });
            }
        }


        // Create a message for each recipient
        const createdMessages = await Promise.all(
            recipientList.map(recipient =>
                Message.create({
                    body,
                    subject,
                    receipientId: recipient.id,
                    senderId: req.userId,
                    dateSent: new Date(),
                    isRead: false,
                    senderDeleted: false,
                    receipentDeleted: false
                })
            )
        );

        res.status(201).json(createdMessages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get messages for current user
export const getUserMessages = async (req, res) => {
    try {
        const inbox = await Message.findAll({
            where: {
                receipientId: req.userId,
                receipentDeleted: false
            },
            include: [
                {
                    model: Reply,
                    as: 'replies',
                    order: [['dateSent', 'ASC']]
                },
                {
                    model: User,
                    as: 'sender',
                    attributes: ['username']
                }
            ],
            order: [['dateSent', 'DESC']]
        });

        const outbox = await Message.findAll({
            where: {
                senderId: req.userId,
                senderDeleted: false
            },
            include: [
                {
                    model: Reply,
                    as: 'replies',
                    order: [['dateSent', 'ASC']]
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['username']
                }
            ],
            order: [['dateSent', 'DESC']]
        });

        res.json({ inbox, outbox });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit message (sender only)
export const editMessage = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await message.update({ message: req.body.message });
        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add reply to message
export const addReply = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user is either sender or recipient
        if (message.senderId !== req.userId && message.receipientId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const reply = await Reply.create({
           body: req.body.body,
            senderId: req.userId,
            messageId: message.id,
            dateSent: new Date()
        });
        message.senderDeleted = false;
        message.receipentDeleted = false;
        await message.save();

        res.status(201).json(reply);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark message as read
export const markAsRead = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user is the recipient
        if (message.receipientId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await message.update({ isRead: true });
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markReplyAsRead = async (req, res) => {
    try {
        const reply = await Reply.findByPk(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        // Verify user is the recipient
        if (reply.senderId === req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await reply.update({ read: true });
        res.json(reply);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Mark message as deleted for sender
export const markAsSenderDeleted = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user is the sender
        if (message.senderId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await message.update({ senderDeleted: true });

        // Check if both parties have deleted the message
        if (message.receipentDeleted) {
            await message.destroy();
            return res.status(204).send();
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark message as deleted for recipient
export const markAsRecipientDeleted = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user is the recipient
        if (message.receipientId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await message.update({ receipentDeleted: true });

        // Check if both parties have deleted the message
        if (message.senderDeleted) {
            await message.destroy();
            return res.status(204).send();
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
