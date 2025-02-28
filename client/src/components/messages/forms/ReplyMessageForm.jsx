import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAddReplyMutation } from '../../../services/MessageApi';
import Swal from 'sweetalert2';

export default function ReplyMessageForm({ originalMessage, onClose }) {
    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addReply({
                id: originalMessage.id,
                reply: {
                    body: replyText
                }
            }).unwrap();
            setReplyText('');
            onClose();
            await Swal.fire('Success', 'Reply sent successfully', 'success');
        } catch (error) {
            console.error('Reply error:', error);
            await Swal.fire('Error', error.data?.message || 'Failed to send reply', 'error');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Reply to: {originalMessage.subject}</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    required
                />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    Send Reply
                </Button>
            </div>
        </Form>
    );
}
