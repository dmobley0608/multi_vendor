import React, { useState } from 'react';
import { Table, Button, Spinner, Pagination, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import {
    useGetVendorByIdQuery,
    useCreatePaymentMutation,
    useUpdatePaymentMutation,
    useDeletePaymentMutation
} from '../../services/Api';
import Swal from 'sweetalert2';
import { useLoading } from '../../context/loadingContext';

export default function VendorPaymentsTable({ vendorId }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newPaymentAmount, setNewPaymentAmount] = useState('');
    const [editPaymentAmount, setEditPaymentAmount] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: vendor, isLoading, refetch } = useGetVendorByIdQuery(vendorId);

    const [createPayment] = useCreatePaymentMutation();
    const [updatePayment] = useUpdatePaymentMutation();
    const [deletePayment] = useDeletePaymentMutation();

    const { showLoading, hideLoading } = useLoading();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

    if (isLoading) return <Spinner animation="border" />;

    const vendorPayments = vendor?.payments || [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = vendorPayments?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((vendorPayments?.length || 0) / itemsPerPage);

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

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
           showLoading('Creating payment...');

            const result = await createPayment({
                vendorId: parseInt(vendorId),
                amount: Math.round(parseFloat(newPaymentAmount) * 100),
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1
            }).unwrap();

            setShowCreateModal(false);
            setNewPaymentAmount('');
            await refetch();

            await Swal.fire({
                title: 'Success',
                text: 'Payment created successfully',
                icon: 'success',
                timer: 1500
            });
        } catch (error) {

            console.error('Create error:', error);
            await Swal.fire('Error', 'Failed to create payment', 'error');
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (payment) => {
        setSelectedPayment(payment);
        setEditPaymentAmount((payment.amount / 100).toFixed(2));
        setShowEditModal(true);
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
           showLoading('Updating payment...');

            await updatePayment({
                id: selectedPayment.id,
                amount: Math.round(parseFloat(editPaymentAmount) * 100),
                vendorId: parseInt(vendorId)
            }).unwrap();

            setShowEditModal(false);
            await refetch();

            await Swal.fire({
                title: 'Success',
                text: 'Payment updated successfully',
                icon: 'success',
                timer: 1500
            });
        } catch (error) {

            console.error('Update error:', error);
            await Swal.fire('Error', 'Failed to update payment', 'error');
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async (payment) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Payment',
                text: 'Are you sure you want to delete this payment?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Delete'
            });

            if (result.isConfirmed) {
               showLoading('Deleting payment...');

                await deletePayment(payment.id).unwrap();
                await refetch();

                await Swal.fire({
                    title: 'Success',
                    text: 'Payment deleted successfully',
                    icon: 'success',
                    timer: 1500
                });
            }
        } catch (error) {

            console.error('Delete error:', error);
            await Swal.fire('Error', 'Failed to delete payment', 'error');
        }finally {
            hideLoading();
        }
    };

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FaPlus className="me-2" /> Cut Check
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(payment => (
                        <tr key={payment.id}>
                            <td>{format(new Date(payment.createdAt), 'MM/dd/yyyy')}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => handleEditClick(payment)}
                                >
                                    <FaEdit />
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger"
                                    onClick={() => handleDeleteClick(payment)}
                                >
                                    <FaTrash />
                                </Button>
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

            {/* Create Modal */}
            <Modal
                show={showCreateModal}
                onHide={() => !isSubmitting && setShowCreateModal(false)}
                backdrop="static"
                keyboard={!isSubmitting}
            >
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>Add New Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreatePayment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={newPaymentAmount}
                                onChange={(e) => setNewPaymentAmount(e.target.value)}
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
                                    'Create Payment'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={showEditModal}
                onHide={() => !isSubmitting && setShowEditModal(false)}
                backdrop="static"
                keyboard={!isSubmitting}
            >
                <Modal.Header closeButton={!isSubmitting}>
                    <Modal.Title>Edit Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdatePayment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={editPaymentAmount}
                                onChange={(e) => setEditPaymentAmount(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
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
                                        <span>Updating...</span>
                                    </div>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}
