import React, { useState } from 'react';
import { Table, Button, Form, Spinner, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useUpdateTransactionItemMutation, useDeleteTransactionItemMutation } from '../../services/TransactionApi';
import { useGetVendorsQuery } from '../../services/Api';
import Swal from 'sweetalert2';

export default function TransactionItemsTable({ transactionData, onRefresh }) {
    const [editingItem, setEditingItem] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const { data: vendors } = useGetVendorsQuery();
    const [updateTransactionItem] = useUpdateTransactionItemMutation();
    const [deleteTransactionItem] = useDeleteTransactionItemMutation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const items = transactionData?.transactions.map((transaction) => transaction.items).flat();
    const totalPages = Math.ceil((items?.length || 0) / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items?.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationItems = () => {
        const items = [];

        // Always add first page
        items.push(
            <Pagination.Item
                key={1}
                active={currentPage === 1}
                onClick={() => handlePageChange(1)}
            >
                1
            </Pagination.Item>
        );

        // Add ellipsis after first page if needed
        if (currentPage > 3) {
            items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
        }

        // Add pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={currentPage === i}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Add ellipsis before last page if needed
        if (currentPage < totalPages - 2) {
            items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
        }

        // Always add last page if there is more than one page
        if (totalPages > 1) {
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setEditedValues({ ...item, price: (item.price / 100).toFixed(2) });
    };

    const handleCancel = () => {
        setEditingItem(null);
        setEditedValues({});
    };

    const handleSave = async (item) => {
        try {
            Swal.fire({
                title: 'Updating Item...',
                text: 'Please wait',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await updateTransactionItem({
                id: item.id,
                vendorId: editedValues.vendorId,
                description: editedValues.description,
                quantity: parseInt(editedValues.quantity),
                price: Math.round(parseFloat(editedValues.price) * 100)
            }).unwrap();

            setEditingItem(null);
            await onRefresh(); // Add this line
            Swal.fire('Success', 'Item updated successfully', 'success');
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire('Error', error.data?.message || 'Failed to update item', 'error');
        }
    };

    const handleDelete = async (item) => {
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
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await deleteTransactionItem(item.id).unwrap();
                await onRefresh(); // Add this line
                Swal.fire('Success', 'Item deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Delete error:', error);
            Swal.fire('Error', error.data?.message || 'Failed to delete item', 'error');
        }
    };

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Vendor ID</th>
                        <th>Description</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems?.map((item) => (
                        <tr key={item.id}>
                            <td>{item.formattedCreatedAt}</td>
                            <td>
                                {item.updatedAt !== item.createdAt
                                    ? item.formattedUpdatedAt
                                    : ''}
                            </td>
                            <td>
                                {editingItem === item.id ? (
                                    <Form.Select
                                        value={editedValues.vendorId}
                                        onChange={(e) => setEditedValues({
                                            ...editedValues,
                                            vendorId: e.target.value
                                        })}
                                    >
                                        {vendors?.map(vendor => (
                                            <option key={vendor.id} value={vendor.id}>
                                                {vendor.id}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : item.vendorId}
                            </td>
                            <td>
                                {editingItem === item.id ? (
                                    <Form.Control
                                        type="text"
                                        value={editedValues.description}
                                        onChange={(e) => setEditedValues({
                                            ...editedValues,
                                            description: e.target.value
                                        })}
                                    />
                                ) : item.description}
                            </td>
                            <td>
                                {editingItem === item.id ? (
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={(editedValues.price)}
                                        onFocus={(e) => e.target.value = ''}
                                        onChange={(e) => setEditedValues({
                                            ...editedValues,
                                            price: e.target.value
                                        })}

                                    />
                                ) : `$${(item.price / 100).toFixed(2)}`}
                            </td>
                            <td>
                                {editingItem === item.id ? (
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={editedValues.quantity}
                                        onChange={(e) => setEditedValues({
                                            ...editedValues,
                                            quantity: parseInt(e.target.value)
                                        })}
                                    />
                                ) : item.quantity}
                            </td>
                            <td>${(item.total / 100).toFixed(2)}</td>
                            <td>
                                {editingItem === item.id ? (
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleSave(item)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(item)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center">
                <Pagination>
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {renderPaginationItems()}
                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    />
                </Pagination>
            </div>
        </>
    );
}
