import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Spinner, Tabs, Tab, Badge } from 'react-bootstrap';
import { FaInbox, FaPaperPlane, FaPlus, FaTrash, FaReply } from 'react-icons/fa';
import { useGetMessagesQuery, useCreateMessageMutation, useDeleteMessageMutation, useMarkMessageAsReadMutation, useGetStaffQuery } from '../../services/MessageApi';
import { useGetVendorsQuery } from '../../services/Api';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import Inbox from '../messages/Inbox';
import Outbox from '../messages/Outbox';
import { useGetUserQuery } from '../../services/Api';

export default function Messages() {
  const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const { data: vendors, isLoading: isVendorsLoading } = useGetVendorsQuery();
  const [createMessage] = useCreateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMessage, setViewMessage] = useState(null);
  const [newMessage, setNewMessage] = useState({
    recipient_ids: [],
    subject: '',
    body: '',
  });
  const [isReply, setIsReply] = useState(false);

  const handleShowModal = () => {
    setIsReply(false);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleShowViewModal = (message, isInbox) => {
    setViewMessage(message);
    setShowViewModal(true);
    if (isInbox && !message.read) {
      markMessageAsRead(message.id);
    }
  };
  const handleCloseViewModal = () => setShowViewModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({ ...newMessage, [name]: value });
  };

  const handleRecipientSelect = (e) => {
    const selectedVendorId = e.target.value;
    if (selectedVendorId === 'all') {
      const allVendorIds = vendors.results.map(vendor => vendor.id.toString());
      setNewMessage({ ...newMessage, recipient_ids: allVendorIds });
    } else if (selectedVendorId && !newMessage.recipient_ids.includes(selectedVendorId)) {
      setNewMessage({ ...newMessage, recipient_ids: [...newMessage.recipient_ids, selectedVendorId] });
    }
  };

  const handleRemoveRecipient = (vendorId) => {
    setNewMessage({ ...newMessage, recipient_ids: newMessage.recipient_ids.filter(id => id !== vendorId) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const recipient_id of newMessage.recipient_ids) {
        await createMessage({ ...newMessage, recipient_ids: [recipient_id] });
      }
      Swal.fire('Success', 'Message sent successfully', 'success');
      handleCloseModal();
    } catch (error) {
      console.log(error)
      Swal.fire('Error', 'Failed to send message', 'error');
    }
  };

  const handleReply = (message) => {
    setNewMessage({
      recipient_ids: [message.sender.toString()],
      subject: `RE: ${message.subject}`,
      body: '',
    });
    setIsReply(true);
    setShowModal(true);
  };

  const handleDelete = async (messageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Deleting this message cannot be undone and the recipients will no longer be able to view the message.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        await deleteMessage(messageId);
        Swal.fire('Deleted!', 'Your message has been deleted.', 'success');
        handleCloseViewModal();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete message', 'error');
      }
    }
  };

  if (isMessagesLoading || isUserLoading || isVendorsLoading) {
    return <Spinner animation="border" />;
  }

  const inboxMessages = messages?.results?.filter((msg) => msg.recipients.some(recipient => recipient.id === user.id));
  const outboxMessages = messages?.results?.filter((msg) => msg.sender === user.id);
  const unreadMessagesCount = inboxMessages?.filter((msg) => !msg.is_read).length;

  return (
    <Container className='p-3'>
      <Row>
        <Col>
          <Button variant="" onClick={handleShowModal}>
            <FaPlus /> New Message
          </Button>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col>
          <Tabs defaultActiveKey="inbox" id="messages-tabs">
            <Tab eventKey="inbox" title={<><FaInbox /> Inbox <Badge bg="secondary">{unreadMessagesCount}</Badge></>}>
              <Inbox messages={inboxMessages} onView={(msg) => handleShowViewModal(msg, true)} onReply={handleReply} user={user} />
            </Tab>
            <Tab eventKey="outbox" title={<><FaPaperPlane /> Outbox</>}>
              <Outbox messages={outboxMessages} onView={(msg) => handleShowViewModal(msg, false)} onDelete={handleDelete} user={user} />
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isReply ? 'Reply Message' : 'New Message'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {isReply && (
              <>
                <Form.Group controlId="subject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={newMessage.subject}
                    onChange={handleInputChange}
                    readOnly
                  />
                </Form.Group>
                <Form.Group controlId="body">
                  <Form.Label>Body</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="body"
                    value={newMessage.body}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter message"
                    required
                  />
                </Form.Group>
              </>
            )}
            {!isReply && (
              <Form.Group controlId="recipients">
                <Form.Label>Select Recipients</Form.Label>
                <Form.Control as="select" onChange={handleRecipientSelect}>
                  <option value="">Select Vendor</option>
                  <option value="all">All Vendors</option>
                  {vendors?.results?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.store_name || vendor.user.name}
                    </option>
                  ))}
                </Form.Control>
                <div className='flex'>
                  <div>
                    <h6>To:</h6>
                  </div>
                  <div className="recipient-list">
                    {newMessage.recipient_ids.map((vendorId, index) => {
                      const vendor = vendors.results.find(v => v.id === parseInt(vendorId));
                      return (
                        <span key={vendorId} className="recipient-badge">
                          {vendor?.store_name || vendor?.user.name}
                          <Button variant="link" size="sm" onClick={() => handleRemoveRecipient(vendorId)}>&times;</Button>
                          {index < newMessage.recipient_ids.length - 1 && '; '}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Form.Group>
            )}
            <Button variant="primary" type="submit" className="mt-3">
              Send
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showViewModal} onHide={handleCloseViewModal}>
        <Modal.Header closeButton>
          <Modal.Title>View Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewMessage && (
            <>
              <p><strong>From:</strong> {viewMessage.sender_email}</p>
              <p><strong>To:</strong> {viewMessage.recipients.map(recipient => recipient.email).join(', ')}</p>
              <p><strong>Subject:</strong> {viewMessage.subject}</p>
              <p><strong>Date:</strong> {new Date(viewMessage.timestamp).toLocaleString()}</p>
              <p><strong>Body:</strong></p>
              <p>{viewMessage.body}</p>
              {viewMessage.recipients.some(recipient => recipient.id === user.id) && (
                <Button variant="primary" onClick={() => handleReply(viewMessage)}>
                  <FaReply /> Reply
                </Button>
              )}
              <Button variant="danger" onClick={() => handleDelete(viewMessage.id)} className="ml-2">
                <FaTrash /> Delete
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
