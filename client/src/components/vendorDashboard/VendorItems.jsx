import React, { useState } from 'react'
import { Table, Button, Modal, Form, Pagination } from 'react-bootstrap'
import { useGetVendorByIdQuery, useUpdateVendorItemMutation, useAddVendorItemMutation, useGetVendorByUserQuery } from '../../services/Api'
import { FaEdit, FaPlus } from 'react-icons/fa'

export default function VendorItems() {
  const { data: vendorData } = useGetVendorByUserQuery()
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  })
  const [updateVendorItem, { isError, error }] = useUpdateVendorItemMutation()
  const [addVendorItem] = useAddVendorItemMutation()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleEditClick = (item) => {
    setIsEditing(true)
    setSelectedItem(item)
    setFormData({
      name: item.name,
      price: item.price / 100
    })
    setShowModal(true)
  }

  const handleAddClick = () => {
    setIsEditing(false)
    setFormData({
      name: '',
      price: ''
    })
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        const res = await updateVendorItem({ itemId: selectedItem.id, ...formData, price: formData.price * 100, vendor: vendorData.id }).unwrap()

      } else {
        const res = await addVendorItem({ ...formData, price: formData.price * 100, vendor: vendorData.id }).unwrap()

      }
      setShowModal(false)
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (!vendorData) return null

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = vendorData.items.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h3 style={{ color: 'black' }}>Items</h3>
        <Button variant="link" onClick={handleAddClick} style={{ backgroundColor: 'transparent' }}>
          <FaPlus size={20} />
        </Button>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>${item.price / 100}</td>
              <td>{item.total_sold || 0}</td>
              <td>
                <Button variant="" onClick={() => handleEditClick(item)} style={{ backgroundColor: 'transparent' }}>
                  <FaEdit size={20} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        {Array.from({ length: Math.ceil(vendorData.items.length / itemsPerPage) }, (_, index) => (
          <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Item' : 'Add Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {isError && <div className="text-danger">Error: {error.message}</div>}
    </>
  )
}
