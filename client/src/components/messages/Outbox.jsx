import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaPaperPlane, FaEye, FaTrash } from 'react-icons/fa';

const Outbox = ({ messages, onView, onDelete, user }) => {
  const sortedMessages = messages?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>To</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedMessages?.length > 0 ? (
            sortedMessages.map((msg, index) => (
              <tr key={`${msg.id}-${index}`} onClick={() => onView(msg)} style={{ cursor: 'pointer' }}>
                <td>{msg?.recipients?.map((recipient) => recipient.email).join(', ') || 'All Vendors'}</td>
                <td>{msg.subject}</td>
                <td>{new Date(msg.timestamp).toLocaleString()}</td>
                <td>{msg.is_read  ? 'Read' : 'Unread'}</td>
                <td>
                  <Button variant="" size="sm" onClick={(e) => { e.stopPropagation(); onView(msg); }} style={{ backgroundColor: 'transparent' }}>
                    <FaEye />
                  </Button>
                  {(msg.sender === user.id || user.is_staff) && (
                    <Button variant="" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }} className="ml-2">
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

export default Outbox;
