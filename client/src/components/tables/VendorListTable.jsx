import React, { useEffect, useState } from 'react'
import { Button, Col, FormControl, Modal, Table } from 'react-bootstrap'
import { useDeleteVendorMutation, useGetVendorsQuery } from '../../services/Api'
import EditButton from '../EditButton'
import DeleteButton from '../DeleteButton'
import AddVendorForm from '../forms/vendor/AddVendorForm'
import Swal from 'sweetalert2'
import { Link } from 'react-router'
import { IoPersonAddSharp } from "react-icons/io5";
import { Pagination } from 'react-bootstrap'
import { FaEye, FaRegEye } from 'react-icons/fa6'
import { useLoading } from '../../context/loadingContext'

export default function VendorListTable() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { data: vendors, isLoading } = useGetVendorsQuery();
    const [vendor, setVendor] = useState()
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation()
    const {showLoading, hideLoading} = useLoading();
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const removeVendor = async (v) => {
        try {
            const { isConfirmed } = await Swal.fire({
                title: `Delete Vendor ${v.id}`,
                text: 'This will also delete the user account associated with the vendor. This action cannot be undone!',
                icon: 'warning',
                confirmButtonText: 'Delete',
                showCancelButton: true,
                cancelButtonText: 'Cancel'
            });

            if (isConfirmed) {
                // Show loading state
                showLoading('Deleting vendor...');

                // Attempt deletion
                const res = await deleteVendor(v.id);

                // Close loading state and show result
                if (res?.error) {
                    await Swal.fire({
                        title: 'Error Deleting Vendor',
                        text: res.error.data?.message || 'An error occurred while deleting the vendor',
                        icon: 'error'
                    });
                } else {
                    await Swal.fire({
                        title: 'Success',
                        text: 'Vendor deleted successfully',
                        icon: 'success'
                    });
                }
            }
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: 'An unexpected error occurred',
                icon: 'error'
            });
        }finally{
            hideLoading();
        }
    };

    useEffect(() => { }, [vendors, vendor])

    // Filter vendors first
    const filteredVendors = vendors?.filter(vendor =>
        vendor.id.toString().includes(searchQuery) ||
        vendor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phoneNumber?.includes(searchQuery) ||
        vendor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then paginate the filtered results
    const indexOfLastVendor = currentPage * itemsPerPage;
    const indexOfFirstVendor = indexOfLastVendor - itemsPerPage;
    const currentVendors = filteredVendors?.slice(indexOfFirstVendor, indexOfLastVendor);
    const totalPages = Math.ceil((filteredVendors?.length || 0) / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Generate pagination buttons with maximum 4 visible
    const getPaginationButtons = () => {
        let buttons = [];
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(startPage + 3, totalPages);

        if (endPage - startPage < 3) {
            startPage = Math.max(1, endPage - 3);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return buttons;
    };
     useEffect(() => {
        if(isLoading){
            showLoading('Loading Vendors...')
        }else{
            hideLoading()
        }
     },[isLoading])

    return (

            <>
                <>
                    <Col className='ms-auto'>
                        <Button variant='' className='icon-font-size' title='Add Vendor' data-bs-toggle="modal" data-bs-target="#addVendorModal" onClick={() => setVendor(() => null)}><IoPersonAddSharp /></Button>
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
                                <th>Name</th>
                                <th>Username</th>
                                <th>Phone Number</th>
                                <th>Alt Phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-start'>
                            {currentVendors?.map(vendor => (
                                <tr key={vendor.id} className="align-middle text-center">
                                    <td>{vendor.id}</td>
                                    <td>{vendor.fullName}</td>
                                    <td>{vendor.user.username}</td>
                                    <td>{vendor.phoneNumber}</td>
                                    <td>{vendor.alternatePhoneNumber}</td>
                                    <td>{vendor.user.email}</td>
                                    <td className=''>
                                        <Link className='text-black' to={`${vendor.id}`}><FaEye className='mx-3'/></Link>

                                        |
                                        <EditButton
                                            onClick={() => setVendor(() => ({ ...vendor }))}
                                            modalId={'#addVendorModal'}
                                            disabled={isDeleting}
                                        />
                                        |
                                        <DeleteButton
                                            onClick={() => removeVendor(vendor)}
                                            disabled={isDeleting}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.Prev
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        {getPaginationButtons()}
                        <Pagination.Next
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </>

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
        </>

        )
}
