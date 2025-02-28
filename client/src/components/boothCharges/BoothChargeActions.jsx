import React, { useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { FaEye, FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useCreateChargeMutation, useUpdateChargeMutation, useDeleteChargeMutation } from '../../services/Api';
import Swal from 'sweetalert2';
import { useLoading } from '../../context/loadingContext';

export default function BoothChargeActions({
    vendorId,
    boothCharge,
    year,
    month,
    onChargeUpdated
}) {
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAmount, setEditAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createCharge] = useCreateChargeMutation();
    const [updateCharge] = useUpdateChargeMutation();
    const [deleteCharge] = useDeleteChargeMutation();
    const { showLoading, hideLoading } = useLoading();


    const handleAddCharge = async () => {
        try {
            const amount = await Swal.fire({
                title: 'Add Booth Charge',
                input: 'number',
                inputLabel: 'Amount ($)',
                inputPlaceholder: 'Enter amount',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value || value <= 0) {
                        return 'Please enter a valid amount';
                    }
                }
            });

            if (amount.isConfirmed) {
                showLoading('Adding booth charge...');
                setIsSubmitting(true);
                await createCharge({
                    vendorId,
                    amount: Math.round(parseFloat(amount.value) * 100),
                    year,
                    month
                }).unwrap();
                await Swal.fire({
                    title: 'Success',
                    text: 'Booth charge added successfully',
                    icon: 'success',
                    timer: 1500
                });
                onChargeUpdated();
            }
        } catch (error) {
            await Swal.fire('Error', 'Failed to add booth charge', 'error');
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

    const handleUpdateCharge = async (e) => {
        e.preventDefault();
        try {

            const numAmount = parseFloat(editAmount);
            if (isNaN(numAmount) || numAmount <= 0) {
                await Swal.fire('Error', 'Please enter a valid amount', 'error');
                return;
            }
            showLoading('Updating booth charge...');
            setIsSubmitting(true);
            await updateCharge({
                id: boothCharge.id,
                amount: Math.round(numAmount * 100),
                vendorId,
                year,
                month
            }).unwrap();

            setShowEditModal(false);
            setShowViewModal(false);
            await Swal.fire('Success', 'Booth charge updated successfully', 'success');
            onChargeUpdated();
        } catch (error) {
            console.error('Update charge error:', error);
            await Swal.fire('Error', `Failed to update booth charge: ${error.message}`, 'error');
        } finally {
            hideLoading();
            setIsSubmitting(false);
        }
    };

    const handleDeleteCharge = async () => {
        try {
            const result = await Swal.fire({
                title: 'Delete Booth Charge',
                text: 'Are you sure you want to delete this booth charge?',
                icon: 'warning',
                showCancelButton: true
            });

            if (result.isConfirmed) {
                showLoading('Deleting booth charge...');
                await deleteCharge(boothCharge.id).unwrap();
                await Swal.fire('Success', 'Booth charge deleted successfully', 'success');
                setShowViewModal(false);
                onChargeUpdated();
            }
        } catch (error) {
           hideLoading();
            await Swal.fire('Error', 'Failed to delete booth charge', 'error');
        }
    };

    const openEditModal = () => {
        if (boothCharge && boothCharge.amount) {
            setEditAmount((boothCharge.amount / 100).toFixed(2));
            setShowEditModal(true);
        }
    };

    const modalBody = boothCharge ? (
        <Modal.Body className="position-relative">
            {isSubmitting && (
                <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                    <div className="text-center">
                        <Spinner animation="border" />
                        <p className="mt-2">Saving changes...</p>
                    </div>
                </div>
            )}
            <p><strong>Amount:</strong> ${((boothCharge.amount || 0) / 100).toFixed(2)}</p>
            <p><strong>Date:</strong> {boothCharge.createdAt ? new Date(boothCharge.createdAt).toLocaleDateString() : 'N/A'}</p>
            <div className="d-flex gap-2 mt-3">
                <Button variant="primary" onClick={openEditModal}>
                    <FaPencilAlt className="me-2" /> Edit
                </Button>
                <Button variant="danger" onClick={handleDeleteCharge}>
                    <FaTrash className="me-2" /> Delete
                </Button>
            </div>
        </Modal.Body>
    ) : null;

    return (
        <>
            {boothCharge ? (
                <>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowViewModal(true)}
                        title="View Booth Charge"
                        disabled={isSubmitting}
                    >
                        <FaEye />
                    </Button>

                    {/* View Modal */}
                    <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Booth Charge Details</Modal.Title>
                        </Modal.Header>
                        {modalBody}
                    </Modal>

                    {/* Edit Modal */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Form onSubmit={handleUpdateCharge}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Booth Charge</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="position-relative">
                                {isSubmitting && (
                                    <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                                        <div className="text-center">
                                            <Spinner animation="border" />
                                            <p className="mt-2">Saving changes...</p>
                                        </div>
                                    </div>
                                )}
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
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </>
            ) : (
                <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleAddCharge}
                    title="Add Booth Charge"
                    disabled={isSubmitting}
                >
                    <FaPlus />
                </Button>
            )}
        </>
    );
}
