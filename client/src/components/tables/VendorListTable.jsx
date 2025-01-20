import React, { useEffect, useState } from 'react'
import { Button, Col, FormControl, Modal, Table } from 'react-bootstrap'
import { useDeleteVendorMutation, useGetVendorsQuery } from '../../services/Api'
import AddPaymentButton from '../AddPaymentButton'
import EditButton from '../EditButton'
import DeleteButton from '../DeleteButton'
import AddVendorPaymentForm from '../forms/vendor/AddVendorPaymentForm'
import AddVendorForm from '../forms/vendor/AddVendorForm'
import Swal from 'sweetalert2'
import { Link } from 'react-router'
import { IoPersonAddSharp } from "react-icons/io5";
import { Pagination } from 'react-bootstrap'

export default function VendorListTable() {
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const { data: vendors, isLoading } = useGetVendorsQuery(currentPage)
    const [vendor, setVendor] = useState()
    const [deleteVendor] = useDeleteVendorMutation()

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };




    const removeVendor = async (v) => {
        const { isConfirmed } = await Swal.fire({
            title: `Delete ${v.id}-${v?.store_name ?? v.user.name}`,
            text: 'This action cannot be undone!',
            icon: 'warning',
            confirmButtonText: 'Delete',
            showCancelButton: true,
            cancelButtonText: 'Cancel'
        })
        if (isConfirmed) {
            const res = await deleteVendor(v.id)
           
            if (res?.error) {
                Swal.fire('Error Deleting Vendor', '', 'error')
            } else {
                Swal.fire('Vendor Deleted', '', 'success')
            }
        }
    }
    useEffect(() => {  }, [vendors, vendor])

    const indexOfLastVendor = currentPage * itemsPerPage
    const indexOfFirstVendor = indexOfLastVendor - itemsPerPage
    const currentVendors = vendors?.results?.slice(indexOfFirstVendor, indexOfLastVendor)
    const filteredVendors = currentVendors?.filter(vendor =>
        vendor.id.toString().includes(searchQuery) ||
        vendor.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.user?.phone_number?.includes(searchQuery) ||
        vendor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paginate = (pageNumber) => setCurrentPage(pageNumber)


    return (
        <>
            {isLoading ? '...Loading' :
                <>
                    <Col className='ms-auto'>
                        <Button variant='' title='Add Vendor' data-bs-toggle="modal" data-bs-target="#addVendorModal" onClick={() => setVendor(() => null)}><IoPersonAddSharp /></Button>
                    </Col>
                    <FormControl
                        type="text"
                        placeholder="Search"
                        className="mb-3"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Table striped='rows' responsive hover borderless>
                        <thead>
                            <tr>
                                <th>Vendor Id</th>
                                <th>Store Name</th>
                                <th>Owner</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Balance</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className='text-start'>
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id}>
                                    <td><Link to={`${vendor.id}`}>{vendor.id}</Link></td>
                                    <td><Link to={`${vendor.id}`}>{vendor.store_name}</Link></td>
                                    <td>{vendor?.user?.name}</td>
                                    <td>{vendor?.user?.phone_number}</td>
                                    <td>{vendor?.user?.email}</td>
                                    <td>${(parseFloat(vendor?.balance / 100)).toFixed(2)}</td>
                                    <td>
                                        <AddPaymentButton onClick={() => setVendor(() => ({ ...vendor }))} />
                                        |
                                        <EditButton onClick={() => setVendor(() => ({ ...vendor }))} modalId={'#addVendorModal'} />
                                        |
                                        <DeleteButton onClick={() => removeVendor(vendor)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(Math.ceil(vendors?.count / itemsPerPage)).keys()].map(number => (
                            <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                                {number + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(vendors?.count / itemsPerPage)} />
                    </Pagination>
                </>
            }
            <div id='addVendorModal' tabIndex={-1} aria-labelledby="addVendorModalLabel" aria-hidden="true"
                className="modal modal-lg"      >
                <Modal.Dialog>
                    <Modal.Header closeButton data-bs-dismiss="modal" aria-label="Close">
                        <Modal.Title>Add New Vendor</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddVendorForm vendor={vendor} />
                    </Modal.Body>
                </Modal.Dialog>
            </div>
            <div id='addVendorPaymentModal' tabIndex={-1} aria-labelledby="addVendorPaymentModalLabel"
                className="modal modal-sm fade"      >
                <Modal.Dialog>
                    <Modal.Header id='addPaymentCloseBtn' closeButton data-bs-dismiss="modal" aria-label="Close">
                        <Modal.Title>New Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddVendorPaymentForm vendor={vendor} />
                    </Modal.Body>
                </Modal.Dialog>
            </div>
        </>

    )
}
