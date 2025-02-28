import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import { useMarkAsSenderDeletedMutation } from '../../services/MessageApi';
import styles from './styles/MessageTables.module.css';
import ReplyBadge from './ReplyBadge';

const Outbox = ({ messages = [], onView, refetch }) => {
  const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const { user } = useAuth();
  const [markAsSenderDeleted] = useMarkAsSenderDeletedMutation();

  const handleDelete = async (msg) => {
    try {
      await markAsSenderDeleted(msg.id).unwrap();
      await refetch();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>To</th>
          <th>Subject</th>
          <th>Date</th>
          <th>Read</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedMessages?.length > 0 ? (
          sortedMessages.map((msg, index) => (
            <tr
              key={`${msg.id}-${index}`}
              onClick={() => onView(msg)}
              className={styles.messageRow}
            >
              <td className="font-weight-normal">{msg?.recipient?.username}</td>
              <td className="font-weight-normal">
                {msg.subject}
                <ReplyBadge message={msg} />
              </td>
              <td className="font-weight-normal">{new Date(msg.createdAt).toLocaleString()}</td>
              <td className="font-weight-normal">{msg.isRead ? 'Yes' : 'No'}</td>
              <td onClick={e => e.stopPropagation()}>
                <div className="d-flex gap-2">
                  <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); onView(msg); }}>
                    <FaEye />
                  </Button>
                  {(msg.sender === user.id) && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg);
                      }}
                    >
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

export default Outbox;
