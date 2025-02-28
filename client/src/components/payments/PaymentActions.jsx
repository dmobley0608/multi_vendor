import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaEye, FaMoneyCheckAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useCreatePaymentMutation, useUpdatePaymentMutation, useDeletePaymentMutation } from '../../services/Api';
import Swal from 'sweetalert2';
import { useLoading } from '../../context/loadingContext';

export default function PaymentActions({
    vendorId,
    payment,
    grossProfit,
    currentBalance,
    year,
    month,
    onPaymentCreated
}) {
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
    const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
    const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();
    const {showLoading, hideLoading, withLoading} = useLoading();


    const handleCreatePayment = async () => {
        try {
            // Calculate the net amount by adding the gross profit and current balance
            const netAmount = grossProfit + (currentBalance < 0 ? currentBalance : 0);

            // Only create payment if there's a positive amount to pay
            if (netAmount <= 0) {
                await Swal.fire('Info', 'No payment needed at this time', 'info');
                return;
            }

            // Show confirmation dialog with the check amount
            const confirmResult = await Swal.fire({
                title: 'Confirm Check Amount',
                text: `Are you sure you want to cut a check for $${(netAmount / 100).toFixed(2)}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Cut Check',
                cancelButtonText: 'Cancel'
            });

            if (confirmResult.isConfirmed) {
               showLoading('Creating payment...');
                await createPayment({
                    vendorId: parseInt(vendorId),
                    amount: netAmount,
                    year,
                    month
                }).unwrap();


                await Swal.fire({
                    title: 'Success',
                    text: 'Payment created successfully',
                    icon: 'success',
                    timer: 1500
                });

                if (onPaymentCreated) {
                    onPaymentCreated();
                }
            }
        } catch (error) {
            console.error('Create payment error:', error);
            await Swal.fire('Error', error.data?.message || 'Failed to create payment', 'error');
        }finally{
            hideLoading();
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();

        try {
            const numAmount = parseFloat(editAmount);
            if (isNaN(numAmount) || numAmount <= 0) {

                await Swal.fire('Error', 'Please enter a valid amount', 'error');
                return;
            }

            if (!payment.id) {

                await Swal.fire('Error', 'Payment ID is missing', 'error');
                return;
            }
           showLoading('Updating payment...');
            await updatePayment({
                id: payment.id, // Make sure this is included
                amount: Math.round(numAmount * 100),
                vendorId,
                year,
                month
            }).unwrap();

            setShowEditModal(false);
            setShowViewModal(false);
            await Swal.fire('Success', 'Payment updated successfully', 'success');
            onPaymentCreated();
        } catch (error) {

            console.error('Update payment error:', error);
            await Swal.fire('Error', `Failed to update payment: ${error.message}`, 'error');
        }finally{
            hideLoading();
        }

    };

    const handleDeletePayment = async () => {
        try {
            const result = await Swal.fire({
                title: 'Delete Payment',
                text: 'Are you sure you want to delete this payment?',
                icon: 'warning',
                showCancelButton: true
            });

            if (result.isConfirmed) {
              showLoading('Deleting payment...');
                await deletePayment(payment.id).unwrap();
                setShowViewModal(false);
                await Swal.fire('Success', 'Payment deleted successfully', 'success');
                onPaymentCreated();
            }
        } catch (error) {
            await Swal.fire('Error', 'Failed to delete payment', 'error');
        }finally{
            hideLoading();
        }
    };

    const openEditModal = () => {
        setEditAmount((payment.amount / 100).toFixed(2));
        setShowEditModal(true);
    };

    // Don't show any payment actions if balance is not positive
    if (grossProfit <= 0 && !payment) {
        return null;
    }



    return (
        <>
            {payment ? (
                <>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowViewModal(true)}
                        title="View Payment Details"
                        disabled={isCreating || isUpdating || isDeleting}
                    >
                        <FaEye />
                    </Button>

                    {/* View Modal */}
                    <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Payment Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>Amount:</strong> ${(payment.amount / 100).toFixed(2)}</p>
                            <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {payment.status}</p>
                            <div className="d-flex gap-2 mt-3">
                                <Button variant="primary" onClick={openEditModal} disabled={isCreating || isUpdating || isDeleting}>
                                    <FaPencilAlt className="me-2" /> Edit
                                </Button>
                                <Button variant="danger" onClick={handleDeletePayment} disabled={isCreating || isUpdating || isDeleting}>
                                    <FaTrash className="me-2" /> Delete
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* Edit Modal */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Form onSubmit={handleUpdatePayment}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Payment</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isCreating || isUpdating || isDeleting}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={isCreating || isUpdating || isDeleting}>
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </>
            ) : grossProfit > 0 ? (
                <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleCreatePayment}
                    title="Cut Check"
                    disabled={isCreating || isUpdating || isDeleting}
                >
                    <FaMoneyCheckAlt />
                </Button>
            ) : null}
        </>
    );
}
