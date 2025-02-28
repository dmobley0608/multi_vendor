import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaReply, FaTrash } from 'react-icons/fa';
import { useMarkAsReadMutation, useMarkAsRecipientDeletedMutation, useMarkReplyAsReadMutation } from '../../../services/MessageApi';
import styles from '../styles/MessageModals.module.css';
import { useAuth } from '../../../context/authContext';

export default function InboxMessageModal({ message, show, onClose, onReply, refetch }) {
    const { user } = useAuth();
    const [markAsRead] = useMarkAsReadMutation();
    const [markReplyAsRead] = useMarkReplyAsReadMutation();
    const [markAsRecipientDeleted] = useMarkAsRecipientDeletedMutation();

    const handleView = async () => {
        if (!message.isRead) {
            try {
                await markAsRead(message.id).unwrap();
                await refetch();
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        }

    };

    const markUnreadReplies = async () => {
        if (message?.replies?.length > 0) {
            const unreadReplies = message.replies.filter(
                reply => !reply.isRead && reply.senderId !== user.id
            );

            for (const reply of unreadReplies) {
                try {
                    await markReplyAsRead({ messageId: message.id, replyId: reply.id }).unwrap();
                } catch (error) {
                    console.error('Error marking reply as read:', error);
                }
            }
        }
    };

    const handleClose = async () => {
        await refetch();
        onClose();
    };

    const handleDelete = async () => {
        try {
            await markAsRecipientDeleted(message.id).unwrap();
            await refetch();
            onClose();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    React.useEffect(() => {
        if (show && message) {
            // Mark message as read
            if (!message.isRead) {
                handleView();
            }
            // Mark replies as read
            markUnreadReplies();
        }
    }, [show, message]);

    const renderReplies = () => {
        if (!message.replies?.length) return null;

        return (
            <div className="mt-4">
                <h6 className="mb-3">Replies:</h6>
                {message.replies.map((reply) => {
                    const isMyReply = reply.senderId === user.id;
                    return (
                        <div
                            key={reply.id}
                            className={`${styles.replyContainer} ${isMyReply ? styles.myReply : styles.otherReply}`}
                        >
                            <div className={styles.replyHeader}>
                                {isMyReply ? 'You' : reply.sender?.username} - {new Date(reply.createdAt).toLocaleString()}
                            </div>
                            <div className={`${styles.replyBody} ${isMyReply ? styles.myReplyBody : styles.otherReplyBody}`}>
                                {reply.body}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!message) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Message from {message.sender?.username}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Subject:</strong> {message.subject}</p>
                <p><strong>Date:</strong> {new Date(message.dateSent).toLocaleString()}</p>

                {/* Original Message */}
                <div className="border p-3 rounded mb-4">
                    {message.body}
                </div>

                {/* Replies Section */}
                {renderReplies()}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => onReply(message)}>
                    <FaReply /> Reply
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    <FaTrash /> Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
