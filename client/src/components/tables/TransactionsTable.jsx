import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Pagination, Form, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaPrint, FaSearch } from 'react-icons/fa';
import { useUpdateTransactionMutation, useDeleteTransactionMutation, useUpdateTransactionItemMutation, useDeleteTransactionItemMutation } from '../../services/TransactionApi';
import Swal from 'sweetalert2';
import { useGetVendorsQuery } from '../../services/Api';
import { useNavigate } from 'react-router';

export default function TransactionsTable({
    transactionData

}) {
    const { count, totalItems, totalAmount, totalSalesTax, grandTotal, transactions } = transactionData;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updateTransaction] = useUpdateTransactionMutation();
    const [deleteTransaction] = useDeleteTransactionMutation();
    const [updateTransactionItem] = useUpdateTransactionItemMutation();
    const [deleteTransactionItem] = useDeleteTransactionItemMutation();
    const [editedItems, setEditedItems] = useState([]);
    const [savingItems, setSavingItems] = useState({});
    const { data: vendors } = useGetVendorsQuery();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const transactionsPerPage = 10;
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

    // Filter transactions based on search and date criteria
    const filteredTransactions = transactions?.filter(transaction => {
        const matchesSearch = searchId ? (
            transaction.id.toLowerCase().includes(searchId.toLowerCase()) ||
            transaction.items.some(item =>
                item.id.toString().toLowerCase().includes(searchId.toLowerCase()) ||
                item.description.toLowerCase().includes(searchId.toLowerCase())
            )
        ) : true;

        const transactionDate = new Date(transaction.createdAt);
        const isAfterStart = startDate ? transactionDate >= new Date(startDate) : true;
        const isBeforeEnd = endDate ? transactionDate <= new Date(endDate) : true;

        return matchesSearch && isAfterStart && isBeforeEnd;
    });

    // Update pagination logic to use filtered transactions
    const currentTransactions = filteredTransactions?.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil((filteredTransactions?.length || 0) / transactionsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchId, startDate, endDate]);

    const handleEditModalOpen = (transaction) => {
        setSelectedTransaction(transaction);
        setEditedItems(transaction.items.map(item => ({ ...item })));
        setShowEditModal(true);
    };

    const handleItemUpdate = (index, field, value) => {
        const updatedItems = [...editedItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'price' ? Math.round(parseFloat(value) * 100) : value,
            hasChanges: true // Track if item has unsaved changes
        };

        // Recalculate total for the item
        if (field === 'price' || field === 'quantity') {
            updatedItems[index].total = (updatedItems[index].price * updatedItems[index].quantity);
        }

        setEditedItems(updatedItems);
    };

    const handleSaveItem = async (item, index) => {
        try {
            // Show loading state
            Swal.fire({
                title: 'Updating Item...',
                text: 'Please wait',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const result = await updateTransactionItem({
                id: item.id,
                vendorId: item.vendorId,
                description: item.description,
                quantity: parseInt(item.quantity),
                price: parseInt(item.price),
                transactionId: selectedTransaction.id
            }).unwrap();

            // Close loading state and show success
            Swal.close();

            if (result) {
                const updatedItems = [...editedItems];
                updatedItems[index].hasChanges = false;
                setEditedItems(updatedItems);

                await Swal.fire({
                    title: 'Success',
                    text: 'Item updated successfully',
                    icon: 'success'
                });
            }
        } catch (error) {
            // Close loading state and show error
            Swal.close();

            console.error('Update error:', error);
            await Swal.fire({
                title: 'Error',
                text: error.data?.message || 'Failed to update item',
                icon: 'error'
            });
        }
    };

    const handleDeleteItem = async (item, index) => {
        try {
            const { isConfirmed } = await Swal.fire({
                title: 'Delete Item',
                text: 'Are you sure you want to delete this item?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel'
            });

            if (isConfirmed) {
                Swal.fire({
                    title: 'Deleting Item...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await deleteTransactionItem(item.id).unwrap();

                // Remove item from local state
                const updatedItems = editedItems.filter((_, i) => i !== index);
                setEditedItems(updatedItems);

                Swal.fire({
                    title: 'Success',
                    text: 'Item deleted successfully',
                    icon: 'success'
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            Swal.fire({
                title: 'Error',
                text: error.data?.message || 'Failed to delete item',
                icon: 'error'
            });
        }
    };

    const handleEditTransaction = async (updatedData) => {
        try {
            Swal.fire({
                title: 'Updating Transaction...',
                text: 'Please wait',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const transactionToUpdate = {
                ...updatedData,
                items: editedItems,
            };

            await updateTransaction(transactionToUpdate).unwrap();
            setShowEditModal(false);
            await Swal.fire('Success', 'Transaction updated successfully', 'success');
        } catch (error) {
            await Swal.fire('Error', 'Failed to update transaction', 'error');
        }
    };

    const handleDeleteTransaction = async (transaction) => {
        try {
            const { isConfirmed } = await Swal.fire({
                title: 'Delete Transaction',
                text: 'Are you sure you want to delete this transaction?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel'
            });

            if (isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Deleting Transaction...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    await deleteTransaction(transaction.id).unwrap();

                    // Close loading state and show success
                    Swal.fire({
                        title: 'Success',
                        text: 'Transaction deleted successfully',
                        icon: 'success',
                    });
                } catch (error) {
                    // Show error message
                    Swal.fire({
                        title: 'Error',
                        text: error.data?.message || 'Failed to delete transaction',
                        icon: 'error'
                    });
                }
            }
        } catch (error) {
            console.error('Delete transaction error:', error);
            Swal.fire({
                title: 'Error',
                text: 'An unexpected error occurred',
                icon: 'error'
            });
        }
    };

    const handleViewDetails = (transaction) => {
        setSelectedDetails(transaction);
        setShowDetailsModal(true);
    };

    const handlePrintInvoice = (transactionId) => {
        setShowDetailsModal(false); // Close the modal
        const printWindow = window.open(
            `/staff/print-invoice/${transactionId}?sidebar=false`,
            '_blank',
            'width=800,height=600'
        );
        printWindow.focus();
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
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return buttons;
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSearchId('');
    };

    return (
        <>

            <Row className='border pt-2 text-start mb-5 rounded pt-4 pb-1 gap-3'>
                <Col md={12} className='pe-5'>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by Transaction ID..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={12} className='d-flex justify-content-end'>
                    <div className="d-flex justify-content-between align-items-end">
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleResetFilters}
                            disabled={!startDate && !endDate && !searchId}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Processed</th>
                        <th>Updated</th>
                        <th>Items Sold</th>
                        <th>Subtotal</th>
                        <th>Sales Tax</th>
                        <th>Payment Method</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTransactions?.map(transaction => (
                        <tr key={transaction.id}>
                            <td>...{transaction.id.slice(-8)}</td>
                            <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                            <td>
                                {transaction.updatedAt !== transaction.createdAt ?
                                    new Date(transaction.updatedAt).toLocaleString()
                                    : ''}
                            </td>
                            <td>{transaction.items.reduce((sum, item) => sum += item.quantity, 0)}</td>
                            <td>${(transaction.subTotal / 100).toFixed(2)}</td>
                            <td>${(transaction.salesTax / 100).toFixed(2)}</td>
                            <td>{transaction.paymentMethod}</td>
                            <td>${(transaction.total / 100).toFixed(2)}</td>
                            <td>
                                <Button
                                    variant=""
                                    className="icon-font-size"
                                    onClick={() => handleViewDetails(transaction)}
                                >
                                    <FaEye />
                                </Button>
                                |
                                <Button
                                    variant=""
                                    className="icon-font-size"
                                    onClick={() => handleEditModalOpen(transaction)}
                                >
                                    <FaEdit />
                                </Button>
                                |
                                <Button
                                    variant=""
                                    className="icon-font-size"
                                    onClick={() => handleDeleteTransaction(transaction)}
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr className="table-dark fw-bold">
                        <td colSpan="3">Totals ({filteredTransactions?.length || 0})</td>
                        <td>{filteredTransactions?.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0) || 0}</td>
                        <td>${((filteredTransactions?.reduce((sum, t) => sum + t.subTotal, 0) || 0) / 100).toFixed(2)}</td>
                        <td>${((filteredTransactions?.reduce((sum, t) => sum + t.salesTax, 0) || 0) / 100).toFixed(2)}</td>
                        <td>
                            Card ({filteredTransactions?.filter(t => t.paymentMethod === 'CARD').length || 0}) :
                            Cash ({filteredTransactions?.filter(t => t.paymentMethod === 'CASH').length || 0})
                        </td>
                        <td>${((filteredTransactions?.reduce((sum, t) => sum + t.total, 0) || 0) / 100).toFixed(2)}</td>
                        <td></td>
                    </tr>
                </tbody>
            </Table>

            <Pagination>
                <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                />
                {getPaginationButtons()}
                <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                />
            </Pagination>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => !isUpdating && setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Transaction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        handleEditTransaction(selectedTransaction);
                    }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select
                                value={selectedTransaction?.paymentMethod}
                                onChange={(e) => setSelectedTransaction({
                                    ...selectedTransaction,
                                    paymentMethod: e.target.value
                                })}
                            >
                                <option value="CASH">CASH</option>
                                <option value="CARD">CARD</option>
                            </Form.Select>
                        </Form.Group>

                        <h6 className="mt-4">Items</h6>
                        <Table striped bordered>
                            <thead>
                                <tr>
                                    <th>Vendor ID</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editedItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Select
                                                value={item.vendorId}
                                                onChange={(e) => handleItemUpdate(index, 'vendorId', e.target.value)}
                                            >
                                                <option value="">Select Vendor</option>
                                                {vendors?.map(vendor => (
                                                    <option key={vendor.id} value={vendor.id}>
                                                        {vendor.id}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.description}
                                                onFocus={(e) => e.target.value = ''}
                                                onChange={(e) => handleItemUpdate(index, 'description', e.target.value)}
                                                onBlur={(e) => e.target.value = item.description}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemUpdate(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={(item.price / 100)}
                                                onChange={(e) => handleItemUpdate(index, 'price', e.target.value)}
                                            />
                                        </td>
                                        <td>${(item.total / 100).toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleSaveItem(item, index)}
                                                    disabled={!item.hasChanges || savingItems[index]}
                                                >
                                                    {savingItems[index] ? (
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteItem(item, index)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <div className="d-flex justify-content-end">
                            <Button
                                variant="secondary"
                                className="me-2"
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

            {/* Details Modal */}
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDetails && (
                        <>
                            <h6>Transaction Information</h6>
                            <Table striped bordered>
                                <tbody>
                                    <tr>
                                        <td><strong>ID:</strong></td>
                                        <td>{selectedDetails.id}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Date/Time:</strong></td>
                                        <td>{new Date(selectedDetails.createdAt).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Payment Method:</strong></td>
                                        <td>{selectedDetails.paymentMethod}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Subtotal:</strong></td>
                                        <td>${(selectedDetails.subTotal / 100).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Sales Tax:</strong></td>
                                        <td>${(selectedDetails.salesTax / 100).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Total:</strong></td>
                                        <td>${(selectedDetails.total / 100).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h6 className="mt-4">Items</h6>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>Vendor ID</th>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetails.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.vendorId}</td>
                                            <td>{item.description}</td>
                                            <td>{item.quantity}</td>
                                            <td>${(item.price / 100).toFixed(2)}</td>
                                            <td>${(item.total / 100).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-between'>
                    <Button
                        variant="secondary"
                        onClick={() => handlePrintInvoice(selectedDetails?.id)}
                    >
                        <FaPrint /> Print
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
