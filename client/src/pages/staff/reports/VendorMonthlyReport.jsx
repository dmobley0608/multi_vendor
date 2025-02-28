import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Table, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useGetVendorMonthlyReportQuery, useGetSettingByKeyQuery } from '../../../services/Api';
import './VendorMonthlyReport.css'; // We'll create this file next

const VendorMonthlyReport = () => {
    const { year, month, vendorId } = useParams();
    const [searchParams] = useSearchParams();
    const { data: report, isLoading, error } = useGetVendorMonthlyReportQuery(
        {
            year: parseInt(year),
            month: parseInt(month)
        },
        {
            refetchOnMountOrArgChange: true
        }
    );
    const { data: commissionSetting } = useGetSettingByKeyQuery('Store_Commission');
    const { data: storeName } = useGetSettingByKeyQuery('Store_Name');
    const { data: storeAddress } = useGetSettingByKeyQuery('Street_Address');
    const { data: storePhone } = useGetSettingByKeyQuery('Phone_Number');
    const { data: storeCity } = useGetSettingByKeyQuery('City');
    const { data: storeState } = useGetSettingByKeyQuery('State');
    const { data: storeZip } = useGetSettingByKeyQuery('Postal_Code');

    const vendor = report?.vendors?.find(v => v.id === parseInt(vendorId));
    const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleDateString();
    const formatMonthYear = (month, year) => {
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    };

    useEffect(() => {
        if (error) {
            console.error('Error loading vendor report:', error);
        }
    }, [error]);

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (!vendor) {
        return (
            <Container className="py-4 px-4">
                <div className="alert alert-warning">
                    No data found for vendor #{vendorId} for {searchParams.get('month')} {year}
                </div>
            </Container>
        );
    }

    // Sort items by date
    const sortedItems = [...vendor.items].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
    );

    return (
        <Container className="report-container py-4 px-4">
            <div className="report-header mb-5">
                <Row>
                    <Col xs={6} className='text-start'>
                        <h6 className="company-name">Helen Underground</h6>
                        <p className="company-details">
                            {storeAddress?.value}<br />
                            {storeCity?.value}, {storeState?.value} {storeZip?.value}<br />
                            {storePhone?.value}
                        </p>
                    </Col>
                    <Col xs={6} className="text-end px-5">

                        <div className="report-meta text-start ms-auto w-75">
                        <h6 className="report-title mb-1">Monthly Sales Report</h6>
                            <p>
                                <strong>Vendor:</strong> {vendor.id} - {vendor.firstName} {vendor.lastName}<br />
                                <strong>Period:</strong> {searchParams.get('month')} {searchParams.get('year')}<br />
                                <strong>Generated:</strong> {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </Col>
                </Row>
                <hr className="my-4" />
            </div>

            <div className="report-summary">
                <h3 className="section-title">Sales Summary</h3>
                <Row>
                    <Col xs={12}>
                        <Table bordered className="summary-table">
                            <tbody>
                                <tr>
                                    <td>Total Items Sold:</td>
                                    <td>{vendor.totalItems}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Cash Sales:</td>
                                    <td className="text-end">{formatCurrency(vendor.cashSales)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Card Sales:</td>
                                    <td className="text-end">{formatCurrency(vendor.cardSales)}</td>
                                </tr>
                                <tr className="table-active">
                                    <td className="fw-bold">Total Sales:</td>
                                    <td className="text-end fw-bold">{formatCurrency(vendor.totalSales)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Store Commission ({commissionSetting?.value}%):</td>
                                    <td className="text-end">{formatCurrency(vendor.storeCommission)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">Previous Balance:</td>
                                    <td className="text-end">{formatCurrency(vendor.previousBalance)}</td>
                                </tr>
                                <tr className="table-active">
                                    <td className="fw-bold">Monthly Balance:</td>
                                    <td className="text-end fw-bold">{formatCurrency(vendor.monthlyBalance)}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>

            {/* Only show Financial Transactions section if there are any transactions to display */}
            {(vendor.boothRentalCharges?.length > 0 ||
                vendor.payments?.length > 0 ||
                vendor.balancePayments?.length > 0) && (
                    <div className="report-financials">
                        <h3 className="section-title">Financial Transactions</h3>
                        <Row>
                            <Col xs={12}>
                                {(vendor.boothRentalCharges?.length > 0 || vendor.payments?.length > 0) && (
                                    <Table bordered className="financial-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Period</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendor.boothRentalCharges?.map(charge => (
                                                <tr key={`charge-${charge.id}`}>
                                                    <td>Booth Rental</td>
                                                    <td>{formatMonthYear(charge.month, charge.year)}</td>
                                                    <td className="text-end">{formatCurrency(charge.amount)}</td>
                                                </tr>
                                            ))}
                                            {vendor.payments?.map(payment => (
                                                <tr key={`payment-${payment.id}`}>
                                                    <td>Payment</td>
                                                    <td>{formatMonthYear(payment.month, payment.year)}</td>
                                                    <td className="text-end">{formatCurrency(payment.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}

                                {vendor.balancePayments?.length > 0 && (
                                    <>
                                        <h4 className="subsection-title">Balance Payments Received</h4>
                                        <Table bordered className="financial-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Method</th>
                                                    <th>Amount</th>
                                                    <th>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendor.balancePayments.map(payment => (
                                                    <tr key={payment.id}>
                                                        <td>{formatDate(payment.paymentDate)}</td>
                                                        <td>{payment.paymentMethod}</td>
                                                        <td className="text-end">{formatCurrency(payment.amount)}</td>
                                                        <td>{payment.description}</td>
                                                    </tr>
                                                ))}
                                                <tr className="table-active">
                                                    <td colSpan="2" className="fw-bold">Total Balance Payments:</td>
                                                    <td className="text-end fw-bold">{formatCurrency(vendor.totalBalancePayments)}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </div>
                )}

            {/* Keep transaction details with its table */}
            <div className="report-details">
                <div className="details-header">
                    <h3 className="section-title">Transaction Details</h3>
                </div>
                <Table bordered striped className="transaction-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th >Price</th>
                            <th>Total</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.map(item => (
                            <tr key={item.id}>
                                <td>{formatDate(item.createdAt)}</td>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td >{formatCurrency(item.price)}</td>
                                <td >{formatCurrency(item.total)}</td>
                                <td>{item.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <div className="report-footer text-center mt-5">
                <p className="small">
                    This report was generated on {new Date().toLocaleString()}<br />
                    For questions contact store management
                </p>
            </div>
        </Container>
    );
};

export default VendorMonthlyReport;
