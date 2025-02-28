import React, { useState } from 'react';
import { Table, Button, Spinner, Pagination, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import {
    useGetVendorByIdQuery,
    useUpdateChargeMutation,
    useDeleteChargeMutation,
    useCreateChargeMutation
} from '../../services/Api';
import Swal from 'sweetalert2';
import { useLoading } from '../../context/loadingContext';

export default function VendorBoothChargesTable({ vendorId }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [selectedCharge, setSelectedCharge] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChargeAmount, setNewChargeAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const itemsPerPage = 10;

    const { data: vendor, isLoading, refetch } = useGetVendorByIdQuery(vendorId);

    const [updateCharge, { isLoading: isUpdating }] = useUpdateChargeMutation();
    const [deleteCharge, { isLoading: isDeleting }] = useDeleteChargeMutation();
    const [createCharge, { isLoading: isCreating }] = useCreateChargeMutation();
    const {showLoading, hideLoading} = useLoading();

    const handleEditClick = (charge) => {
        setSelectedCharge(charge);
        setEditAmount((charge.amount / 100).toFixed(2));
        setShowEditModal(true);
    };

    const handleUpdateCharge = async (e) => {
        e.preventDefault();
       showLoading('Updating booth charge...');
        try {
            const result = await updateCharge({
                id: selectedCharge.id,
                amount: Math.round(parseFloat(editAmount) * 100),
                vendorId,
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1
            }).unwrap();

            if (result) {
                setShowEditModal(false);
                await Swal.fire('Success', 'Booth charge updated successfully', 'success');

                refetch();
            }
        } catch (error) {
            console.error('Update error:', error);
            await Swal.fire('Error', error.data?.message || 'Failed to update booth charge', 'error');
        }finally{
            hideLoading();
        }
    };

    const handleDeleteClick = async (charge) => {

        try {
            const confirmResult = await Swal.fire({
                title: 'Delete Booth Charge',
                text: 'Are you sure you want to delete this booth charge?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it',
                cancelButtonText: 'Cancel'
            });

            if (!confirmResult.isConfirmed) {

                return;
            }

            showLoading('Deleting booth charge...');
            const deleteResult = await deleteCharge(charge.id).unwrap();

            // Wait for both the delete operation and refetch to complete
            await Promise.all([deleteResult, refetch()]);

            await Swal.fire({
                title: 'Deleted!',
                text: 'Booth charge has been deleted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {

            console.error('Delete error:', error);
            await Swal.fire({
                title: 'Error',
                text: error.data?.message || 'Failed to delete booth charge',
                icon: 'error'
            });
        }finally{
            hideLoading();
        }
    };

    const handleCreateCharge = async (e) => {
        e.preventDefault();
        try {
            showLoading('Creating booth charge...');
            setIsSubmitting(true);

            const createResult = await createCharge({
                vendorId: parseInt(vendorId),
                amount: Math.round(parseFloat(newChargeAmount) * 100),
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1
            }).unwrap();

            if (createResult) {
                // Close modal first
                setShowCreateModal(false);
                setNewChargeAmount('');

                // Then show success message
                await Swal.fire({
                    title: 'Success',
                    text: 'Booth charge created successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                // Finally refetch data
                await refetch();
            }
        } catch (error) {
            console.error('Create error:', error);
            await Swal.fire({
                title: 'Error',
                text: error.data?.message || 'Failed to create booth charge',
                icon: 'error'
            });
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

    const isProcessing = isLoading || isUpdating || isDeleting || isCreating;

    if (isProcessing) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" />
                <p className="mt-2">Processing...</p>
            </div>
        );
    }

    const vendorCharges = vendor?.boothRentalCharges || [];

    // Sort charges by year and month, most recent first
    const sortedCharges = [...vendorCharges].sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }
        return b.month - a.month;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedCharges.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedCharges.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

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

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    disabled={isProcessing}
                >
                    <FaPlus className="me-2" /> Add Booth Charge
                </Button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>For</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(charge => (
                        <tr key={charge.id}>
                            <td>{charge.month}/{charge.year}</td>
                            <td>{formatCurrency(charge.amount)}</td>
                            <td>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => handleEditClick(charge)}
                                    disabled={isProcessing}
                                >
                                    <FaEdit />
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger"
                                    onClick={() => handleDeleteClick(charge)}
                                    disabled={isProcessing}
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => !isUpdating && setShowEditModal(false)}>
                <Modal.Header closeButton={!isUpdating}>
                    <Modal.Title>Edit Booth Charge</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateCharge}>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                required
                                disabled={isUpdating}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Updating...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Create Modal */}
            <Modal
                show={showCreateModal}
                onHide={() => !isSubmitting && setShowCreateModal(false)}
                backdrop="static"
                keyboard={!isSubmitting}
            >
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>Add New Booth Charge</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isSubmitting && (
                        <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 1 }}>
                            <div className="text-center">
                                <Spinner animation="border" />
                                <p className="mt-2">Creating charge...</p>
                            </div>
                        </div>
                    )}
                    <Form onSubmit={handleCreateCharge}>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={newChargeAmount}
                                onChange={(e) => setNewChargeAmount(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowCreateModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="d-flex align-items-center">
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create Charge'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

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
    );
}
