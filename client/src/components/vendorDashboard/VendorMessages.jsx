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
import UnreadMessageBadge from '../messages/UnreadMessageBadge';

export default function Messages() {
  const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const { data: vendors, isLoading: isVendorsLoading } = useGetVendorsQuery();
  const { data: staff, isLoading: isStaffLoading } = useGetStaffQuery();
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
    setNewMessage({
      recipient_ids: [],
      subject: '',
      body: '',
    })
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
    const selectedId = e.target.value;
    if (selectedId === 'all') {
      const allIds = (user.is_staff ? vendors.results : staff.results).map(v => v.user.id);
      setNewMessage({ ...newMessage, recipient_ids: allIds });
    } else if (selectedId && !newMessage.recipient_ids.includes(selectedId)) {
      setNewMessage({ ...newMessage, recipient_ids: [...newMessage.recipient_ids, selectedId] });
    }
  };

  const handleRemoveRecipient = (vendorId) => {
    setNewMessage({ ...newMessage, recipient_ids: newMessage.recipient_ids.filter(id => id !== vendorId) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let count = 0
      let errorCount = 0
      if (user.is_staff) {
        for (const recipient_id of newMessage.recipient_ids) {
          const res = await createMessage({ ...newMessage, recipient_ids: [recipient_id] });

          if (res.data) {

            count++;
          }
          if (res.error) {

            errorCount++;
          }
        }
        if (errorCount > 0) {
          Swal.fire('Error', `Failed to send ${errorCount} message(s).`, 'error');
          return
        }else{
          Swal.fire('Success', `${count} Message(s) sent successfully`, 'success');
        }
      } else {
        const res = await createMessage({ ...newMessage });
        if (res.error) {
          Swal.fire('Error', 'Failed to send message', 'error');
          return
        }
        if(res.data){
          Swal.fire('Success', `Message sent successfully`, 'success');
        }

      }


      handleCloseModal();
    } catch (error) {
    
      Swal.fire('Error', 'Failed to send message', 'error');
    }
  };

  const handleReply = (message) => {
    setNewMessage({
      recipient_ids: [message.sender],
      subject: `RE: ${message.subject}`,
      body: '',
    });
    setIsReply(true);
    setShowModal(true);
    setShowViewModal(false);
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

  if (isMessagesLoading || isUserLoading || isVendorsLoading || isStaffLoading) {
    return <Spinner animation="border" />;
  }

  const inboxMessages = messages?.results?.filter((msg) => msg.recipients.some(recipient => recipient.id === user.id));
  const outboxMessages = messages?.results?.filter((msg) => msg.sender === user.id);


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
            <Tab eventKey="inbox" title={<><FaInbox /> Inbox <UnreadMessageBadge/></>}>
              <Inbox messages={inboxMessages} onView={(msg) => handleShowViewModal(msg, true)} onReply={handleReply} user={user} onDelete={handleDelete} />
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
              <>
                <Form.Group controlId="recipients">
                  <Form.Label>{user.is_staff ? 'Select Recipients' : 'To: STORE FRONT'}</Form.Label>
                  {user.is_staff && <Form.Control as="select" onChange={handleRecipientSelect}>
                    <option value="">Select Vendor</option>
                    <option value="all">All Vendors</option>
                    {(user.is_staff ? vendors?.results : staff?.results)?.map((item) => (
                      <option key={item.id} value={item.user.id}>
                        {item.store_name || item.user.name}
                      </option>
                    ))}
                  </Form.Control>
                  }
                  <div className='flex'>
                    <div>
                      {user.is_Staff && <h6>To:</h6>}
                    </div>
                    <div className="recipient-list">
                      {newMessage.recipient_ids.map((id, index) => {
                        const recipient = (user.is_staff ? vendors.results : staff.results).find(v => v.user.id === parseInt(id));
                        return (
                          <span key={id} className="recipient-badge">
                            {recipient?.store_name || recipient?.user.name}
                            <Button variant="link" size="sm" onClick={() => handleRemoveRecipient(id)}>&times;</Button>
                            {index < newMessage.recipient_ids.length - 1 && '; '}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Form.Group>
                <Form.Group controlId="subject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={newMessage.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                    required
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
              {user.is_staff && (
                <Button variant="danger" onClick={() => handleDelete(viewMessage.id)} className="ml-2">
                  <FaTrash /> Delete
                </Button>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
