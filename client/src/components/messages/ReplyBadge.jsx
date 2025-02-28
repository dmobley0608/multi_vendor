import React from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { useAuth } from '../../context/authContext';

export default function ReplyBadge({ message }) {
    const { user } = useAuth();

    if (!message?.replies) return null;

    const unreadReplies = message.replies.filter(
        reply => !reply.read && reply.senderId !== user.id
    ).length;

    return unreadReplies > 0 ? (
        <Badge bg="info" className="ms-1">
            {unreadReplies}
        </Badge>
    ) : null;
}
