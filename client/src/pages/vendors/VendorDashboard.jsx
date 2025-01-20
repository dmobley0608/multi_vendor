import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Tab, Tabs, ListGroup, Modal, Form, Table, Badge } from 'react-bootstrap'
import { useGetVendorByUserQuery, useUpdateVendorMutation } from '../../services/Api'
import { useGetMessagesQuery } from '../../services/MessageApi'
import Swal from 'sweetalert2'
import { FaEdit, FaInbox } from 'react-icons/fa'
import VendorInfo from '../../components/vendorDashboard/VendorInfo'
import VendorItems from '../../components/vendorDashboard/VendorItems'
import VendorMessages from '../../components/vendorDashboard/VendorMessages'
import VendorPayments from '../../components/vendorDashboard/VendorPayments'
import { useNavigate } from 'react-router'
import UserProfile from '../UserProfile'; // Import UserProfile component
import UnreadMessageBadge from '../../components/messages/UnreadMessageBadge'

export default function VendorDashboard() {
  const { data: vendorData } = useGetVendorByUserQuery()
  const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    store_name: '',
    user: {
      email: '',
      name: '',
      phone_number: ''
    },
    street_address: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [updateVendor, { isLoading, isError, isSuccess, error }] = useUpdateVendorMutation()
  const navigate = useNavigate()

  useEffect(() => {

    if (vendorData) {
      setFormData({
        store_name: vendorData.store_name || '',
        user: {
          id: vendorData.user.id,
          email: vendorData.user.email || '',
          name: vendorData.user.name || '',
          phone_number: vendorData.user.phone_number || ''
        },
        street_address: vendorData.street_address || '',
        city: vendorData.city || '',
        state: vendorData.state || '',
        postal_code: vendorData.postal_code || '',
        items: []
      })
    }
  }, [vendorData])

  useEffect(() => {
    if (isSuccess) {
      Swal.fire('Success', 'Vendor information updated successfully', 'success')
    } else if (isError) {
      Swal.fire('Error', 'Failed to update vendor information', 'error')
      console.error('Update error:', error)
    }
  }, [isSuccess, isError, error])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name in formData.user) {
      setFormData({ ...formData, user: { ...formData.user, [name]: value } })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateVendor({ id: vendorData.id, ...formData })
    setShowModal(false)

  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!vendorData) return null



  return (
    <Container className=''>
      <div className="d-flex justify-content-between align-items-center">
        <h1>{vendorData.store_name} Dashboard</h1>
        <Button variant="danger" onClick={handleSignOut}>Sign Out</Button>
      </div>
      <Tabs defaultActiveKey="dashboard" id="vendor-dashboard-tabs">
        <Tab eventKey="dashboard" title="Dashboard">
          <Row className='mt-3' >
            <Col md={6}  className='mb-3'>
              <VendorInfo />
            </Col>
            <Col md={4} className="d-flex flex-column justify-content-center align-items-center">
              <h6 className='text-danger'>Balance: ${(vendorData.balance/100).toFixed(2)}</h6>
              <h6 className='text-success'>YTD: ${(vendorData?.ytd_sales/100).toFixed(2)}</h6>
            </Col>
            <Col md={12}>
              <VendorItems />
              <VendorPayments />
            </Col>

          </Row>
        </Tab>
        <Tab eventKey="messages" title={<><FaInbox /> Messages <UnreadMessageBadge/></>}>
          <VendorMessages />
        </Tab>
        <Tab eventKey="profile" title="Profile">
          <UserProfile />
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formStoreName">
              <Form.Label>Store Name</Form.Label>
              <Form.Control type="text" name="store_name" value={formData.store_name} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.user.email} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.user.name} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" name="phone_number" value={formData.user.phone_number} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formStreetAddress">
              <Form.Label>Street Address</Form.Label>
              <Form.Control type="text" name="street_address" value={formData.street_address} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formCity">
              <Form.Label>City</Form.Label>
              <Form.Control type="text" name="city" value={formData.city} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formState">
              <Form.Label>State</Form.Label>
              <Form.Control type="text" name="state" value={formData.state} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formPostalCode">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3" disabled={isLoading}>Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  )
}
