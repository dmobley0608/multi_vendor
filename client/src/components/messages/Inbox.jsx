import React, { useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { FaInbox, FaEye, FaReply, FaTrash } from 'react-icons/fa';

const Inbox = ({ messages, onView, onReply, onDelete, user }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const sortedMessages = messages?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleView = (msg) => {
    setSelectedMessage(msg);
    onView(msg);
  };

  const handleClose = () => {
    setSelectedMessage(null);
  };

  const handleReply = (msg) => {
    if (!msg.is_read) {
      onView(msg); // Mark as read
    }
    onReply(msg);
  };

  const handleDelete = (msg) => {
    onDelete(msg.id);
  };

  return (
    <>
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
            sortedMessages.map((msg, index) => (
              <tr key={`${msg.id}-${index}`}  className={!msg.is_read ? 'fw-bold' : ''}>
                <td onClick={() => handleView(msg)} style={{ cursor: 'pointer' }} className={!msg.is_read ? 'fw-bold' : ''}>{msg.sender_email}</td>
                <td onClick={() => handleView(msg)} style={{ cursor: 'pointer' }} className={!msg.is_read ? 'fw-bold' : ''}>{msg.subject}</td>
                <td onClick={() => handleView(msg)} style={{ cursor: 'pointer' }} className={!msg.is_read ? 'fw-bold' : ''}>{new Date(msg.timestamp).toLocaleString()}</td>
                <td onClick={() => handleView(msg)} style={{ cursor: 'pointer' }} className={!msg.is_read ? 'fw-bold' : ''}>{msg.is_read ? 'Read' : 'Unread'}</td>
                <td>
                  <Button variant="" size="sm" onClick={(e) => { e.stopPropagation(); handleView(msg); }} style={{ backgroundColor: 'transparent' }}>
                    <FaEye />
                  </Button>
                  <Button variant="" size="sm" onClick={(e) => { e.stopPropagation(); handleReply(msg); }} className="ml-2">
                    <FaReply />
                  </Button>
                  {user.is_staff && (
                    <Button variant="" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(msg); }} className="ml-2">
                      <FaTrash />
                    </Button>
                  )}
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


    </>
  );
};

export default Inbox;
