import React, { useState, useEffect } from 'react'
import { Row, Col, Button, ListGroup, Modal, Form } from 'react-bootstrap'
import { useGetVendorByIdQuery, useGetVendorByUserQuery, useUpdateVendorMutation } from '../../services/Api'
import Swal from 'sweetalert2'
import { FaEdit } from 'react-icons/fa'

export default function VendorInfo() {
  const { data: vendorData } = useGetVendorByUserQuery()
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
        items:[]
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

  if (!vendorData) return null

  return (
    <>
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <h2 style={{ color: 'black' }}>Contact Information</h2>
            <Button variant="" onClick={() => setShowModal(true)} style={{ backgroundColor: 'transparent' }}>
              <FaEdit size={20} />
            </Button>
          </div>
          <ListGroup>
            <ListGroup.Item>Name: {vendorData.user.name}</ListGroup.Item>
            <ListGroup.Item>Email: {vendorData.user.email}</ListGroup.Item>
            <ListGroup.Item>Phone: {vendorData.user.phone_number || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Address: {vendorData.street_address}, {vendorData.city}, {vendorData.state} {vendorData.postal_code}</ListGroup.Item>

          </ListGroup>
        </Col>
      </Row>

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
    </>
  )
}
