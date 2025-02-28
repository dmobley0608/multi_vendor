import React from 'react';
import { Card, Table, Pagination } from 'react-bootstrap';

export default function SalesTable({ data, period, currentPage, onPageChange, vendorId }) {
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.items.length / itemsPerPage);

    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

    return (
        <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    {period.charAt(0).toUpperCase() + period.slice(1)} Sales - Vendor ID: {vendorId}
                </h5>
                <div>
                    <small className="text-muted me-3">
                        Total Sales: {formatCurrency(data.totalAmount)}
                    </small>
                    <small className="text-muted me-3">
                        Total Profit: {formatCurrency(data.totalProfit)}
                    </small>
                    <small className="text-muted">
                        Items Sold: {data.items.length}
                    </small>
                </div>
            </Card.Header>
            <Card.Body>
                <Table responsive striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Id</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(item => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString()}</td>
                                <td>{item.id.slice(-8)}</td>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.price)}</td>
                                <td>{formatCurrency(item.total)}</td>
                                <td>{item.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {data.items.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            />
                            {[...Array(totalPages)].map((_, idx) => (
                                <Pagination.Item
                                    key={idx + 1}
                                    active={idx + 1 === currentPage}
                                    onClick={() => onPageChange(idx + 1)}
                                >
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
