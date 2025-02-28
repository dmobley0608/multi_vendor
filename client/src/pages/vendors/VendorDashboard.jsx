import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Tab, Tabs, Form, Modal } from 'react-bootstrap';
import { useGetVendorByUserQuery, useUpdateVendorMutation } from '../../services/Api';
import { FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Messages from '../../components/messages/MessagesLayout';
import UnreadMessageBadge from '../../components/messages/UnreadMessageBadge';
import SalesTable from './components/SalesTable';
import ProfileInfo from './components/ProfileInfo';

import { useAuth } from '../../context/authContext';
import { useGetUserMessagesQuery } from '../../services/MessageApi';

export default function VendorDashboard() {
  const { data: messages, isLoading: messagesLoading } = useGetUserMessagesQuery();
  const { data: vendors } = useGetVendorByUserQuery();
  const [updateVendor] = useUpdateVendorMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    alternateNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [salesTabs] = useState(['daily', 'weekly', 'monthly', 'yearly', 'allTime']);
  const [currentPages, setCurrentPages] = useState({
    daily: 1,
    weekly: 1,
    monthly: 1,
    yearly: 1,
    allTime: 1
  });
  const itemsPerPage = 5;

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const selectedVendor = vendors?.find(v => v.id === selectedVendorId) || vendors?.[0];

  useEffect(() => {
    if (selectedVendor) {
      setFormData({
        firstName: selectedVendor.firstName || '',
        lastName: selectedVendor.lastName || '',
        email: selectedVendor.user.email || '',
        phoneNumber: selectedVendor.phoneNumber || '',
        alternateNumber: selectedVendor.alternateNumber || '',
        streetAddress: selectedVendor.streetAddress || '',
        city: selectedVendor.city || '',
        state: selectedVendor.state || '',
        postalCode: selectedVendor.postalCode || ''
      });
    }
  }, [selectedVendor]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateVendor({
        id: selectedVendor.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        alternateNumber: formData.alternateNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        user: selectedVendor.user
      }).unwrap();

      setShowEditModal(false);
      await Swal.fire('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      await Swal.fire('Error', error.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    try {
      await updateVendor({
        id: selectedVendor.id,
        password: passwordData.newPassword,
        user: selectedVendor.user
      }).unwrap();

      setShowPasswordModal(false);
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      await Swal.fire('Success', 'Password updated successfully', 'success');
    } catch (error) {
      await Swal.fire('Error', error.data?.message || 'Failed to update password', 'error');
    }
  };

  const handleSignOut = async () => {
    await auth.logout()
  };

  const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

  return (
    <>
      <div className='nav bg-dark text-white p-3'>
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-4">
              <Form.Select
                className="w-auto"
                value={selectedVendorId || ''}
                onChange={(e) => setSelectedVendorId(Number(e.target.value))}
              >
                {vendors?.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    ID: {vendor.id} - {vendor.firstName} {vendor.lastName}
                  </option>
                ))}
              </Form.Select>
              <h5 className="mb-0">Balance: {formatCurrency(selectedVendor?.balance || 0)}</h5>
            </div>
            <Button variant="outline-light" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </Container>
      </div >
      <Container className="py-4">

        <Tabs defaultActiveKey="sales" className="mb-4">
          <Tab eventKey="sales" title="Sales Details">
            <Tabs defaultActiveKey="daily" id="sales-period-tabs" className="mb-3">
              {salesTabs.map(period => (
                <Tab
                  key={period}
                  eventKey={period}
                  title={period.charAt(0).toUpperCase() + period.slice(1)}
                >
                  <SalesTable
                    data={selectedVendor?.sales?.[period] || { items: [], totalAmount: 0, totalProfit: 0 }}
                    period={period}
                    currentPage={currentPages[period]}
                    onPageChange={(page) => setCurrentPages(prev => ({
                      ...prev,
                      [period]: page
                    }))}
                    vendorId={selectedVendor?.id}
                  />
                </Tab>
              ))}
            </Tabs>
          </Tab>

          <Tab eventKey="messages" title={<><FaInbox /> Messages <UnreadMessageBadge messages={messages?.inbox || []} /></>}>
            <Messages />
          </Tab>
          <Tab eventKey="profile" title="Profile">
            <Row>
              <Col md={6}>
                <ProfileInfo
                  vendor={selectedVendor}
                  onEdit={() => setShowEditModal(true)}
                  onPasswordChange={() => setShowPasswordModal(true)}
                />
              </Col>
            </Row>
          </Tab>
        </Tabs>

        {/* Edit Profile Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateProfile}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}

                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Alternative Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="alternateNumber"
                      value={formData.alternateNumber}
                      onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}

                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}

                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}

                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}

                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Password Modal */}
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdatePassword}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Password
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
