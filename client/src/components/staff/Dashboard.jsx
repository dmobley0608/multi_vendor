import React, { useEffect, useState } from 'react'
import { useGetDailyTransactionsQuery, useLazyGetMonthlyTransactionsQuery, useLazyGetWeeklyTransactionsQuery } from '../../services/TransactionApi'
import { Button, Col, Container, Row, Table, Form, Spinner } from 'react-bootstrap'
import TransactionItemsTable from '../tables/TransactionItemsTable'
import { useGetVendorsQuery } from '../../services/Api'
import { useLoading } from '../../context/loadingContext'

const Dashboard = () => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [isTableLoading, setIsTableLoading] = useState(false);
    const { data: vendors } = useGetVendorsQuery();
    const { data, isLoading, isError, refetch: fetchDaily } = useGetDailyTransactionsQuery()
    const [fetchWeekly] = useLazyGetWeeklyTransactionsQuery()
    const [fetchMonthly] = useLazyGetMonthlyTransactionsQuery()
    const [transactionData, setTransactionData] = React.useState({ ...data })
    const [tableTitle, setTableTitle] = React.useState('Daily')
    const { showLoading, hideLoading } = useLoading();
    const updateTable = React.useCallback(async () => {
        setIsTableLoading(true);
        try {
            let fetchedData;
            if (tableTitle === 'Daily') {
                const { data } = await fetchDaily();
                fetchedData = data;
            } else if (tableTitle === 'Weekly') {
                const { data } = await fetchWeekly();
                fetchedData = data;
            } else if (tableTitle === 'Monthly') {
                const { data } = await fetchMonthly();
                fetchedData = data;
            }

            // Filter transactions by vendor if selected
            if (selectedVendor && fetchedData) {
                // Filter transactions that have items for the selected vendor
                const filteredTransactions = fetchedData.transactions.map(transaction => ({
                    ...transaction,
                    items: transaction.items.filter(item => item.vendorId === parseInt(selectedVendor))
                })).filter(transaction => transaction.items.length > 0);

                // Calculate new totals based on filtered items
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
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsTableLoading(false);
        }
    }, [tableTitle, selectedVendor, fetchDaily, fetchWeekly, fetchMonthly]);

    React.useEffect(() => {
        updateTable();
    }, [tableTitle, selectedVendor]);

    useEffect(() => {
        if (isLoading) {
            showLoading('Loading...')
        } else {
            hideLoading()
        }
    }, [isLoading])

    if (isLoading) return ''

    return (
        <Container className='mt-5'>
            <Row className='mb-5'>
                <Col md={4}>
                    <h1 className='text-start fs-4'>{tableTitle} Sales</h1>
                </Col>
                <Col md={4}>
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
                <Col md={4} className='d-flex align-items-end justify-content-end'>
                    <div className='d-flex gap-3'>
                        <Button
                            onClick={() => setTableTitle('Daily')}
                            variant={tableTitle === 'Daily' ? 'primary' : 'outline-primary'}
                            disabled={isTableLoading}
                        >
                            Daily
                        </Button>
                        <Button
                            onClick={() => setTableTitle('Weekly')}
                            variant={tableTitle === 'Weekly' ? 'primary' : 'outline-primary'}
                            disabled={isTableLoading}
                        >
                            Weekly
                        </Button>
                        <Button
                            onClick={() => setTableTitle('Monthly')}
                            variant={tableTitle === 'Monthly' ? 'primary' : 'outline-primary'}
                            disabled={isTableLoading}
                        >
                            Monthly
                        </Button>
                    </div>
                </Col>
            </Row>

            {isTableLoading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading transactions...</p>
                </div>
            ) : (
                <TransactionItemsTable
                    transactionData={transactionData}
                    onRefresh={updateTable}  // Add this prop
                />
            )}

            <Container className='mt-5 '>
                <Row>
                    <Col md={4}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th colSpan={2} className='text-center'>
                                        Sales Summary
                                        <small className='ms-2'>
                                            ({transactionData?.totalItems} {transactionData?.totalItems === 1 ? ' Items' : ' Items'} Sold)
                                        </small>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='text-start'>Gross Sales</td>
                                    <td className='text-end'>${(transactionData?.totalAmount / 100)?.toFixed(2) || 0}</td>
                                </tr>
                                <tr>
                                    <td className='text-start'>Sales Tax Collected</td>
                                    <td className='text-end'>${(transactionData?.totalSalesTax / 100)?.toFixed(2) || 0}</td>
                                </tr>
                                <tr>
                                    <td className='text-start'>Total Sales</td>
                                    <td className='text-end'>${(transactionData?.grandTotal / 100)?.toFixed(2) || 0}</td>
                                </tr>
                            </tbody>

                        </Table>
                    </Col>
                </Row>

            </Container>
        </Container>
    )
}

export default Dashboard
