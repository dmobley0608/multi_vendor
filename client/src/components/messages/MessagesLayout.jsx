import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaInbox, FaPaperPlane, FaPlus, FaTrash, FaReply } from 'react-icons/fa';
import { useGetUserMessagesQuery, useMarkAsReadMutation, useMarkAsRecipientDeletedMutation, useMarkAsSenderDeletedMutation, useAddReplyMutation } from '../../services/MessageApi';
import { useGetVendorsQuery } from '../../services/Api';
import { useAuth } from '../../context/authContext';
import Swal from 'sweetalert2';
import NewMessageForm from './forms/NewMessageForm';
import ReplyMessageForm from './forms/ReplyMessageForm';
import Inbox from './Inbox';
import Outbox from './Outbox';
import UnreadMessageBadge from './UnreadMessageBadge';
import InboxMessageModal from './modals/InboxMessageModal';
import OutboxMessageModal from './modals/OutboxMessageModal';
import ReplyBadge from './ReplyBadge';

export default function Messages() {
  const { data: messages, isLoading: isMessagesLoading, refetch: refetchMessages } = useGetUserMessagesQuery();
  const [markMessageAsRead] = useMarkAsReadMutation();
  const [markAsSenderDeleted] = useMarkAsSenderDeletedMutation()
  const [markAsRecipientDeleted] = useMarkAsRecipientDeletedMutation();
  const [addReply] = useAddReplyMutation();
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewInboxMessage, setViewInboxMessage] = useState(null);
  const [viewOutboxMessage, setViewOutboxMessage] = useState(null);
  const { user } = useAuth();
  const { data: vendors } = useGetVendorsQuery(undefined, {
    skip: !user?.isStaff
  });

  const handleShowModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleReply = async (originalMessage, replyText) => {
    try {
      await addReply({
        id: originalMessage.id,
        reply: {
          body: replyText
        }
      }).unwrap();
      setShowReplyModal(false);
      setViewInboxMessage(null);  // Close inbox modal
      setViewOutboxMessage(null); // Close outbox modal
      await refetchMessages();
      await Swal.fire('Success', 'Reply sent successfully', 'success');
    } catch (error) {
      console.error('Reply error:', error);
      await Swal.fire('Error', error.data?.message || 'Failed to send reply', 'error');
    }
  };


  if (isMessagesLoading) {
    return <Spinner animation="border" />;
  }

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
            <Tab eventKey="inbox" title={<><FaInbox /> Inbox <UnreadMessageBadge messages={messages?.inbox} /></>}>
              <Inbox
                messages={messages?.inbox || []}
                onView={setViewInboxMessage}
                onReply={(msg) => {
                  setSelectedMessage(msg);
                  setShowReplyModal(true);
                }}
              />
            </Tab>
            <Tab eventKey="outbox" title={<><FaPaperPlane /> Outbox   <UnreadMessageBadge messages={messages?.outbox} /></>}>
              <Outbox
                messages={messages?.outbox || []}
                onView={setViewOutboxMessage}
              />

            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* New Message Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewMessageForm
            vendors={vendors || []}
            onClose={handleCloseModal}
          />
        </Modal.Body>
      </Modal>

      {/* Message View Modals */}
      <InboxMessageModal
        message={viewInboxMessage}
        show={!!viewInboxMessage}
        onClose={() => setViewInboxMessage(null)}
        onReply={(msg) => {
          setSelectedMessage(msg);
          setShowReplyModal(true);
        }}
        refetch={refetchMessages}
      />

      <OutboxMessageModal
        message={viewOutboxMessage}
        show={!!viewOutboxMessage}
        onClose={() => setViewOutboxMessage(null)}
        refetch={refetchMessages}
      />

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReplyMessageForm
            originalMessage={selectedMessage}
            onClose={() => {
              setShowReplyModal(false);
              refetchMessages(); // Add refetch after reply
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
