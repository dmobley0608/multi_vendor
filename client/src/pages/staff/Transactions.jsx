import React, { useState, useCallback } from 'react';
import { Button, Col, Container, Row, Table, Form, Spinner } from 'react-bootstrap';
import { useGetVendorsQuery } from '../../services/Api';
import {
    useGetTransactionsQuery,
    useLazyGetDailyTransactionsQuery,
    useLazyGetWeeklyTransactionsQuery,
    useLazyGetMonthlyTransactionsQuery
} from '../../services/TransactionApi.js';
import TransactionsTable from '../../components/tables/TransactionsTable';

const Transactions = () => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isTableLoading, setIsTableLoading] = useState(false);
    const { data: vendors } = useGetVendorsQuery();
    const { data: allTransactions, isLoading, isError } = useGetTransactionsQuery();
    const [fetchDaily] = useLazyGetDailyTransactionsQuery();
    const [fetchWeekly] = useLazyGetWeeklyTransactionsQuery();
    const [fetchMonthly] = useLazyGetMonthlyTransactionsQuery();
    const [transactionData, setTransactionData] = useState(null);

    const updateTransactions = useCallback(async () => {
        setIsTableLoading(true);
        try {
            let fetchedData;
            switch (timeFilter) {
                case 'daily':
                    const { data: dailyData } = await fetchDaily();
                    fetchedData = dailyData;
                    break;
                case 'weekly':
                    const { data: weeklyData } = await fetchWeekly();
                    fetchedData = weeklyData;
                    break;
                case 'monthly':
                    const { data: monthlyData } = await fetchMonthly();
                    fetchedData = monthlyData;
                    break;
                default:
                    fetchedData = allTransactions;
            }

            if (fetchedData) {
                // Filter by vendor and search term if present
                if (selectedVendor ) {
                    const filteredTransactions = fetchedData.transactions.map(transaction => ({
                        ...transaction,
                        items: transaction.items.filter(item => {
                            const vendorMatch = !selectedVendor || item.vendorId === parseInt(selectedVendor);
                            return vendorMatch;
                        })
                    })).filter(transaction => transaction.items.length > 0);

                    // Recalculate totals for filtered items
                    const totalItems = filteredTransactions.reduce((acc, t) =>
                        acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);
                    const totalAmount = filteredTransactions.reduce((acc, t) =>
                        acc + t.items.reduce((sum, item) => sum + item.total, 0), 0);
                    const totalSalesTax = Math.round(totalAmount * 0.07);

                    fetchedData = {
                        ...fetchedData,
                        transactions: filteredTransactions,
                        totalItems,
                        totalAmount,
                        totalSalesTax,
                        grandTotal: totalAmount + totalSalesTax,
                    };
                }
                setTransactionData(fetchedData);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsTableLoading(false);
        }
    }, [timeFilter, selectedVendor, searchTerm, fetchDaily, fetchWeekly, fetchMonthly, allTransactions]);

    React.useEffect(() => {
        updateTransactions();
    }, [timeFilter, selectedVendor, updateTransactions]);

    if (isLoading) return <p>Loading transactions...</p>;
    if (isError) return <p>Error: {isError.message}</p>;
    return (
        <Container className="py-4">
            <Row className="mb-4 align-items-center justify-content-between">

                <Col md={3}>
                    <Form.Group>
                        <Form.Select
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                        >
                            <option value="">All Vendors</option>
                            {vendors?.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                    {vendor.id} - {vendor.firstName} {vendor.lastName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <div className="d-flex gap-2 justify-content-end">
                        {['all', 'daily', 'weekly', 'monthly'].map((period) => (
                            <Button
                                key={period}
                                variant={timeFilter === period ? 'primary' : 'outline-primary'}
                                onClick={() => setTimeFilter(period)}
                                disabled={isTableLoading}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </Button>
                        ))}
                    </div>
                </Col>
            </Row>

            {isTableLoading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading transactions...</span>
                    </Spinner>
                    <p className="mt-2">Loading transactions...</p>
                </div>
            ) : (
                <>
                    {transactionData && <TransactionsTable transactionData={transactionData} />}

                    <Row className="mt-4">
                        <Col md={4}>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="text-center">
                                            Summary
                                            {transactionData?.totalItems && (
                                                <small className="ms-2">
                                                    ({transactionData.totalItems} items)
                                                </small>
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Gross Sales</td>
                                        <td className="text-end">
                                            ${((transactionData?.totalAmount || 0) / 100).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sales Tax</td>
                                        <td className="text-end">
                                            ${((transactionData?.totalSalesTax || 0) / 100).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Total</td>
                                        <td className="text-end">
                                            ${((transactionData?.grandTotal || 0) / 100).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Transactions;
