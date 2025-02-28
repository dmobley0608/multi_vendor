import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Nav, Tab } from 'react-bootstrap';
import { useGetUserQuery } from '../services/Api';
import { useGetVendorByUserQuery, useUpdateVendorMutation } from '../services/Api';
import Swal from 'sweetalert2';

export default function UserProfile() {
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const { data: vendorData, isLoading: isVendorLoading } = useGetVendorByUserQuery();

  const [updateVendor] = useUpdateVendorMutation();
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        alternatePhoneNumber: user.alternatePhoneNumber || '',
        streetAddress: user.streetAddress || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || ''
      }));
    }
    if (vendorData) {
      setFormData(prevData => ({
        ...prevData,
        storeName: vendorData.storeName || '',
        streetAddress: vendorData.streetAddress || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        postalCode: vendorData.postalCode || '',
      }));
    }
  }, [user, vendorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateVendor({
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        alternatePhoneNumber: formData.alternatePhoneNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode
      });

      if (res.error) {
        Swal.fire('Error', 'Failed to update information', 'error');
        return;
      }

      Swal.fire('Success', 'Information updated successfully', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to update information', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }
    try {
      const res = await updateVendor({
        id: user.id,
        password: formData.newPassword,
      });

      if (res.error) {
        Swal.fire('Error', 'Failed to update password', 'error');
        return;
      }

      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      Swal.fire('Success', 'Password updated successfully', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to update password', 'error');
    }
  };

  if (isUserLoading || isVendorLoading) {
    return <Spinner animation="border" />;
  }

  return (
    <Container className='p-3'>

      <Tab.Container defaultActiveKey="general">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="general">General Information</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password">Update Password</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="general">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Alternate Phone</Form.Label>
                        <Form.Control
                          type="text"
                          name="alternatePhoneNumber"
                          value={formData.alternatePhoneNumber}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Address Fields */}
                  <Form.Group className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Form>
              </Tab.Pane>

              <Tab.Pane eventKey="password">
                <Form onSubmit={handlePasswordSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          required
                          autoComplete="new-password"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          autoComplete="new-password"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit">
                    Update Password
                  </Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
