import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { useMarkAsSenderDeletedMutation, useAddReplyMutation, useMarkReplyAsReadMutation } from '../../../services/MessageApi';
import styles from '../styles/MessageModals.module.css';
import { useAuth } from '../../../context/authContext';
import Swal from 'sweetalert2';

export default function OutboxMessageModal({ message, show, onClose, refetch }) {
    const { user } = useAuth();
    const [markAsSenderDeleted] = useMarkAsSenderDeletedMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();
    const [markReplyAsRead] = useMarkReplyAsReadMutation();

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

    React.useEffect(() => {
        if (show && message) {
            markUnreadReplies();
        }
    }, [show, message]);

    React.useEffect(() => {
        if (message) {
            setEditedBody(message.body);
        }
    }, [message]);

    const handleDelete = async () => {
        try {
            await markAsSenderDeleted(message.id).unwrap();
            await refetch();
            onClose();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleUpdate = async () => {
        // Add update message mutation here when available
        setIsEditing(false);
    };

    const handleClose = async () => {
        await refetch();
        onClose();
    };

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            await addReply({
                id: message.id,
                reply: {
                    body: replyText
                }
            }).unwrap();
            setReplyText('');
            setShowReplyForm(false);
            onClose(); // Close the modal after reply
            await refetch();
            await Swal.fire('Success', 'Reply sent successfully', 'success');
        } catch (error) {
            console.error('Reply error:', error);
            await Swal.fire('Error', error.data?.message || 'Failed to send reply', 'error');
        }
    };

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
                <Modal.Title>Message to {message?.recipient?.username}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Subject:</strong> {message?.subject}</p>
                <p><strong>Date:</strong> {new Date(message?.dateSent).toLocaleString()}</p>
                <p><strong>Status:</strong> {message?.isRead ? 'Read' : 'Unread'}</p>

                {/* Original Message */}
                {isEditing ? (
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                    />
                ) : (
                    <div className="border p-3 rounded mb-4">
                        {message?.body}
                    </div>
                )}

                {/* Replies Section */}
                {!isEditing && (
                    <>
                        {renderReplies()}
                        {message.replies?.length > 0 && !showReplyForm && (
                            <div className="mt-3">
                                <Button variant="primary" onClick={() => setShowReplyForm(true)}>
                                    <FaReply /> Reply
                                </Button>
                            </div>
                        )}
                        {showReplyForm && (
                            <Form onSubmit={handleReply} className="mt-3">
                                <Form.Group>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        required
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    <Button variant="secondary" onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyText('');
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Send Reply
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {isEditing ? (
                    <>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleUpdate}>
                            Save Changes
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            <FaTrash /> Delete
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}
