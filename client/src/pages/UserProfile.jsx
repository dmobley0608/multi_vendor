import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Spinner, Nav, Tab } from 'react-bootstrap';
import { useGetUserQuery, useUpdateUserMutation } from '../services/Api';
import { useGetVendorByUserQuery, useUpdateVendorMutation } from '../services/Api';
import Swal from 'sweetalert2';

export default function UserProfile() {
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const { data: vendorData, isLoading: isVendorLoading } = useGetVendorByUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [updateVendor] = useUpdateVendorMutation();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone_number: '',
    new_password: '',
    confirm_password: '',
  });

  const [vendorFormData, setVendorFormData] = useState({
    store_name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        phone_number: user.phone_number || '',
        id:user.id
      });
    }
    if (vendorData) {
      setVendorFormData({
        store_name: vendorData.store_name || '',
        street_address: vendorData.street_address || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        postal_code: vendorData.postal_code || '',
      });

    }
  }, [user, vendorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData({ ...vendorFormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      if (vendorData) {

        let body = {
          id: vendorData.id,
          items:[],
          user:{
            id:user.id,
            name:formData.name,
            phone_number:formData.phone_number
          },
          ...vendorFormData }
        let res = await updateVendor(body);

        if(res.error){
          Swal.fire('Error', 'Failed to update information', 'error');
          return
        }
      }else{
        const res = await updateUser({ id: user.id, ...formData });

        if(res.error){
          Swal.fire('Error', 'Failed to update information', 'error');
          return
        }
      }
      Swal.fire('Success', 'Information updated successfully', 'success');
    } catch (error) {
        console.log(error)
      Swal.fire('Error', 'Failed to update information', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      Swal.fire('Error', 'New password and confirm password do not match', 'error');
      return;
    }
    try {
      const res = await updateUser({ id: user.id, name:user.name,  password: formData.new_password });
      
        if(res.error){
            Swal.fire('Error', 'Failed to update password', 'error');
            return
        }
      Swal.fire('Success', 'Password updated successfully', 'success');
    } catch (error) {
        console.log(error)
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
                      <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="phone_number">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {vendorData && (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group controlId="store_name">
                            <Form.Label>Store Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="store_name"
                              value={vendorFormData.store_name}
                              onChange={handleVendorInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="street_address">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                              type="text"
                              name="street_address"
                              value={vendorFormData.street_address}
                              onChange={handleVendorInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <Form.Group controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={vendorFormData.city}
                              onChange={handleVendorInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="state">
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={vendorFormData.state}
                              onChange={handleVendorInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="postal_code">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              type="text"
                              name="postal_code"
                              value={vendorFormData.postal_code}
                              onChange={handleVendorInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}
                  <Button variant="primary" type="submit" className="mt-3">
                    Save Changes
                  </Button>
                </Form>
              </Tab.Pane>
              <Tab.Pane eventKey="password">
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group controlId="username" className="d-none">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={user.email}
                      readOnly
                      autoComplete="username"
                    />
                  </Form.Group>
                  <Row>
                    <Col md={4}>
                      <Form.Group controlId="new_password">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleInputChange}
                          required
                          autoComplete="new-password"
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={0} md={12}></Col>
                    <Col md={4} className='mt-3'>
                      <Form.Group controlId="confirm_password">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          required
                          autoComplete="new-password"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" className="mt-3">
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
