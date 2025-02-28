import React, { useEffect } from 'react'

import { Badge, Spinner } from 'react-bootstrap'
import { useGetUserMessagesQuery } from '../../services/MessageApi';
import { useAuth } from '../../context/authContext';

export default function UnreadMessageBadge({ messages=[] }) {
  const { user } = useAuth();

  let count = 0;
  messages.forEach(msg => {
    if (!msg.isRead && msg.senderId !== user.id) count++;
  });
  messages.forEach(msg => {
    count += msg.replies.filter(reply => !reply.read && reply.senderId !== user.id ).length;
  });

  useEffect(() => {

  }, [messages]);
  return (
    <Badge bg='secondary'>
      {count > 0 && `${count}`}
    </Badge>
  )
}
