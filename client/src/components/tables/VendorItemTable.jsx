import React, { useState } from 'react'
import { Table, Button, Pagination, Modal, Col, Row } from 'react-bootstrap'
import { FaEdit, FaTrash } from 'react-icons/fa'
import AddVendorItemForm from '../forms/vendor/AddVendorItemForm'
import { useDeleteVendorItemMutation } from '../../services/VendorApi'
import { BiAddToQueue } from 'react-icons/bi'

const VendorItemTable = ({ items, vendor }) => {
    const [deleteItem, { isLoading: deleteLoad }] = useDeleteVendorItemMutation()
    const [item, setItem] = useState()
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Calculate the items to display based on the current page
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    //Remove Item From Vendor

    const removeItem = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Delete Item',
            text: 'This action cannot be undone!',
            icon: 'warning',
            confirmButtonText: 'Delete',
            showCancelButton: true,
            cancelButtonText: 'Cancel'
        })
        if (isConfirmed) {
            const res = await deleteItem(id)
            console.log(res)
            if (res?.error) {
                Swal.fire('Error Deleting Item', '', 'error')
            } else {
                Swal.fire('Item Deleted', '', 'success')
            }
        }
    }


    return (
        <>
            <Row className='mb-3'>
                <Col>
                    <h5>Items</h5>
                </Col>

                <Col>
                    <Button variant='' data-bs-toggle="modal" data-bs-target="#addVendorItemModal" onClick={() => setItem(null)}><BiAddToQueue/></Button>
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>${(item.price/100).toFixed(2)}</td>
                            <td>
                                <Button size='sm' variant='transparent' className="me-2" onClick={() => setItem(item)} data-bs-toggle="modal" data-bs-target="#addVendorItemModal">
                                    <FaEdit />
                                </Button>
                                |
                                <Button size='sm' variant="transparent" className='ms-2'>
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {[...Array(Math.ceil(items.length / itemsPerPage)).keys()].map(number => (
                    <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                        {number + 1}
                    </Pagination.Item>
                ))}
            </Pagination>

            {/* Add and update Item Form */}
            <div id='addVendorItemModal' tabIndex={-1} aria-labelledby="addVendorItemModalLabel" aria-hidden="true"
                className="modal modal-sm fade"      >
                <Modal.Dialog>
                    <Modal.Header closeButton data-bs-dismiss="modal" aria-label="Close">
                        <Modal.Title>Add New Vendor Item</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddVendorItemForm vendor={vendor} vendorItem={item} />
                    </Modal.Body>
                </Modal.Dialog>
            </div>
        </>
    )
}

export default VendorItemTable