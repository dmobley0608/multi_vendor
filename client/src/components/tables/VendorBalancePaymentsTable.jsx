import React, { useState } from 'react';
import { Table, Button, Spinner, Pagination, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import {
    useGetVendorByIdQuery,
    useCreateBalancePaymentMutation,
    useDeleteBalancePaymentMutation
} from '../../services/Api';
import Swal from 'sweetalert2';
import { useLoading } from '../../context/loadingContext';

export default function VendorBalancePaymentsTable({ vendorId }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDescription, setPaymentDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Check');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: vendor, isLoading, refetch } = useGetVendorByIdQuery(vendorId);
    const [createBalancePayment] = useCreateBalancePaymentMutation();
    const [deleteBalancePayment] = useDeleteBalancePaymentMutation();

    const {showLoading, hideLoading} = useLoading();
    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            await createBalancePayment({
                vendorId: parseInt(vendorId),
                amount: parseInt(paymentAmount), // Changed to parseInt
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod,
                description: paymentDescription.trim()
            }).unwrap();

            setShowCreateModal(false);
            resetForm();
            await refetch();
            await Swal.fire('Success', 'Payment created successfully', 'success');
        } catch (error) {
            console.error('Create error:', error);
            await Swal.fire('Error', 'Failed to create payment', 'error');
        }
    };

    const handleDeleteClick = async (payment) => {

        const result = await Swal.fire({
            title: 'Delete Payment',
            text: 'Are you sure you want to delete this payment?',
            icon: 'warning',
            showCancelButton: true
        });

        if (result.isConfirmed) {
           showLoading('Deleting payment...');
            try {
                await deleteBalancePayment(payment.id).unwrap();
                await refetch();
                await Swal.fire('Success', 'Payment deleted successfully', 'success');
            } catch (error) {
                console.error('Delete error:', error);
                await Swal.fire('Error', 'Failed to delete payment', 'error');
            }finally{
                hideLoading();
            }
        }
    };

    const resetForm = () => {
        setPaymentAmount('');
        setPaymentDescription('');
        setPaymentMethod('Check');
    };

    // Add pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = vendor?.balancePayments?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((vendor?.balancePayments?.length || 0) / itemsPerPage);

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
                <Button variant="success" size="sm" onClick={() => setShowCreateModal(true)}>
                    <FaPlus className="me-2" /> Add Balance Payment
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(payment => (
                        <tr key={payment.id}>
                            <td>{format(new Date(payment.paymentDate), 'MM/dd/yyyy')}</td>
                            <td>${(payment.amount / 100).toFixed(2)}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>{payment.description}</td>
                            <td>
                                <Button variant="link" size="sm" className="text-danger"
                                    onClick={() => handleDeleteClick(payment)}>
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
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Balance Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreatePayment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                step="1"
                                min="1"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required
                            >
                                <option value="Check">Check</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={paymentDescription}
                                onChange={(e) => setPaymentDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Create Payment
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}
