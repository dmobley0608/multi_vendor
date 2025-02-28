import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaEye, FaReply, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import { useMarkAsReadMutation, useMarkAsRecipientDeletedMutation } from '../../services/MessageApi';
import ReplyBadge from './ReplyBadge';

const Inbox = ({ messages = [], onView, onReply, refetch }) => {
  const { user } = useAuth();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAsRecipientDeleted] = useMarkAsRecipientDeletedMutation();
  const sortedMessages = [...messages].sort((a, b) =>
    new Date(b.dateSent) - new Date(a.dateSent)
  );

  const handleView = async (msg) => {
    if (!msg.isRead) {
      try {
        await markAsRead(msg.id).unwrap();
        await refetch();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    onView(msg);
  };

  const handleDelete = async (msg) => {
    try {
      await markAsRecipientDeleted(msg.id).unwrap();
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getMessageStyle = (isRead) => ({
    cursor: 'pointer',
    fontWeight: !isRead ? '600' : 'normal'  // Use explicit font-weight instead of bootstrap class
  });

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>From</th>
          <th>Subject</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedMessages?.length > 0 ? (
          sortedMessages.map((msg) => (
            <tr
              key={msg.id}
              style={getMessageStyle(msg.isRead)}
              onClick={() => handleView(msg)}
            >
              <td>{msg.sender?.username}</td>
              <td>
                {msg.subject}
                <ReplyBadge message={msg} />
              </td>
              <td>{new Date(msg.dateSent).toLocaleString()}</td>
              <td>{msg.isRead ? 'Read' : 'Unread'}</td>
              <td onClick={e => e.stopPropagation()}>
                <div className="d-flex gap-2">
                  <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); handleView(msg); }}>
                    <FaEye />
                  </Button>
                  {msg.senderId !== user.id && (
                    <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); onReply(msg); }}>
                      <FaReply />
                    </Button>
                  )}
                  {user.isStaff && (
                    <Button variant="link" size="sm" className="text-danger" onClick={(e) => { e.stopPropagation(); handleDelete(msg); }}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">No messages to display</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Inbox;
