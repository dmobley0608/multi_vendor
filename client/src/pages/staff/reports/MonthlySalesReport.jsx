import React from 'react';
import { useSearchParams, useParams } from 'react-router';
import { useGetSettingByKeyQuery, useGetVendorMonthlyReportQuery } from '../../../services/Api';
import { format } from 'date-fns';
import { Spinner } from 'react-bootstrap';
import './MonthlySalesReport.css';

export default function MonthlySalesReport() {
    const { year, month } = useParams();
    const [searchParams] = useSearchParams();

    const { data: monthlyReport, isLoading } = useGetVendorMonthlyReportQuery({
        year: parseInt(year),
        month: parseInt(month)
    });
    const { data: commissionSetting } = useGetSettingByKeyQuery('Store_Commission');
    const { data: salesTaxRate } = useGetSettingByKeyQuery('Sales_Tax');
    const { data: storeName } = useGetSettingByKeyQuery('Store_Name');
    const { data: storePhone } = useGetSettingByKeyQuery('Phone_Number');
    const { data: streetAddress } = useGetSettingByKeyQuery('Street_Address');
    const { data: city } = useGetSettingByKeyQuery('City');
    const { data: state } = useGetSettingByKeyQuery('State');
    const { data: postalCode } = useGetSettingByKeyQuery('Postal_Code');

    // Auto-print when data is ready
    React.useEffect(() => {
        if (monthlyReport && searchParams.get('sidebar') === 'false') {
            setTimeout(() => window.print(), 1000);
        }
    }, [monthlyReport]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" />
                <span className="ms-2">Loading report data...</span>
            </div>
        );
    }

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(amount / 100);

    const getCurrentMonthCharge = (charges) => charges?.[0];

    // Sort vendors by ID
    const sortedVendors = monthlyReport?.vendors
        ? [...monthlyReport.vendors].sort((a, b) => a.id - b.id)
        : [];

    return (
        <div className="sales-report">
            {/* Store Summary Page */}
            <div className='vendor-page'>
                <div className="report-header">
                    <h1>STORE SALES SUMMARY</h1>
                    <h2>For: {searchParams.get('month')} {searchParams.get('year')}</h2>
                </div>

                <div className="sales-details">
                    {/* Calculate store totals */}
                    {(() => {
                        const totals = monthlyReport?.vendors.reduce((acc, vendor) => ({
                            totalItems: acc.totalItems + vendor.totalItems,
                            totalSales: acc.totalSales + vendor.totalSales,
                            totalCommission: acc.totalCommission + vendor.storeCommission,
                            totalPayments: acc.totalPayments + vendor.totalPayments,
                            totalEarnings: acc.totalEarnings + vendor.monthlyEarnings,
                            totalBoothRental: acc.totalBoothRental + (vendor.boothRentalCharges[0]?.amount || 0),
                            totalAccountsReceivable: acc.totalAccountsReceivable + (vendor.monthlyBalance < 0 ? Math.abs(vendor.monthlyBalance) : 0),
                            totalAccountsPayable: acc.totalAccountsPayable + (vendor.monthlyBalance > 0 ? vendor.monthlyBalance : 0),
                        }), {
                            totalItems: 0,
                            totalSales: 0,
                            totalCommission: 0,
                            totalPayments: 0,
                            totalEarnings: 0,
                            totalBoothRental: 0,
                            totalAccountsReceivable: 0,
                            totalAccountsPayable: 0,
                        });

                        const salesTax = totals.totalSales * 0.07; // 7% sales tax

                        return (
                            <>
                                <div className="section-header">Sales Information</div>
                                <div className="sales-row">
                                    <span>Total Items Sold</span>
                                    <span>{totals.totalItems}</span>
                                </div>
                                <div className="sales-row">
                                    <span>Total Sales (Pre-tax)</span>
                                    <span>{formatCurrency(totals.totalSales)}</span>
                                </div>
                                <div className="sales-row">
                                    <span>Sales Tax ({salesTaxRate?.value}%)</span>
                                    <span>{formatCurrency(salesTax)}</span>
                                </div>
                                <div className="sales-row total-row">
                                    <span>Total Sales (Including Tax)</span>
                                    <span>{formatCurrency(totals.totalSales + salesTax)}</span>
                                </div>

                                <div className="section-header">Store Revenue</div>
                                <div className="sales-row">
                                    <span>Store Commission</span>
                                    <span>{formatCurrency(totals.totalCommission)}</span>
                                </div>


                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Individual Vendor Pages - Use sortedVendors instead of monthlyReport.vendors */}
            {sortedVendors.map((vendor) => (
                <div key={vendor.id} className="vendor-page">
                    <div className='d-flex justify-content-between'>
                        <div className="vendor-info text-start mb-3">
                            <h4>VENDOR INFORMATION</h4>
                            <p className="mb-1"><strong>Vendor ID:</strong> {vendor.id}</p>
                            <p className="mb-1"><strong>Name:</strong> {vendor.firstName} {vendor.lastName}</p>
                            <p className="mb-3"><strong>Statement Date:</strong> {format(new Date(), 'MMMM d, yyyy')}</p>
                        </div>
                        <div className="store-info  mb-3 text-end">
                            <h3>{storeName?.value}</h3>
                            <p className="mb-1">PO Box {streetAddress?.value}</p>
                            <p className="mb-1">{city?.value}, {state?.value} {postalCode?.value}</p>
                            <p className="mb-3">Phone: {storePhone?.value}</p>
                        </div>


                    </div>
                    <div className="header-section ">
                        <div className="report-header text-center">
                            <h5>SALES SUMMARY</h5>
                            <h6>For: {searchParams.get('month')} {searchParams.get('year')}</h6>
                        </div>
                    </div>

                    <div className="sales-details">
                        <div className="section-header">Sales</div>
                        <div className="sales-row">
                            <span>CASH SALES</span>
                            <span>{formatCurrency(vendor.cashSales)}</span>
                        </div>
                        <div className="sales-row">
                            <span>CREDIT CARD SALES</span>
                            <span>{formatCurrency(vendor.cardSales)}</span>
                        </div>
                        <div className="sales-row total-row">
                            <span>TOTAL SALES</span>
                            <span>{formatCurrency(vendor.totalSales)}</span>
                        </div>

                        <div className="section-header">Charges</div>
                        <div className="sales-row">
                            <span>STORE COMMISSION ({commissionSetting?.value}%)</span>
                            <span>{formatCurrency(vendor.storeCommission)}</span>
                        </div>
                        <div className="sales-row">
                            <span>BOOTH RENT</span>
                            <span>{formatCurrency(getCurrentMonthCharge(vendor.boothRentalCharges)?.amount || 0)}</span>
                        </div>
                        <div className="sales-row total-row">
                            <span>TOTAL CHARGES</span>
                            <span className=''>{formatCurrency(vendor.storeCommission + (getCurrentMonthCharge(vendor.boothRentalCharges)?.amount || 0))}</span>
                        </div>

                        <div className="section-header">Balance</div>
                        <div className="sales-row">
                            <span>MONTHLY EARNINGS</span>
                            <span>{formatCurrency(vendor.monthlyEarnings)}</span>
                        </div>
                        <div className="sales-row">
                            <span>PREVIOUS BALANCE</span>
                            <span> {formatCurrency(vendor.previousBalance)}</span>
                        </div>
                        <div className="sales-row">
                            <span>{(vendor.monthlyEarnings + vendor.previousBalance) > 0 ? 'FINAL EARNINGS' : 'PAYMENT DUE'}</span>
                            <span>{formatCurrency(vendor.monthlyEarnings + vendor.previousBalance)}</span>
                        </div>
                        {vendor.totalBalancePayments > 0 && (
                            <>
                                <div className="section-header">Payments</div>
                                {vendor.balancePayments.map(payment => (
                                    <div key={payment.id} className="sales-row">
                                        <span>{format(new Date(payment.paymentDate), 'MM/dd/yyyy')} <b className='ms-5'>{payment.paymentMethod} {payment.description}</b></span>
                                        <span>{formatCurrency(payment.amount)}</span>
                                    </div>
                                ))}
                            </>
                        )}


                        <div className="sales-row total-row">
                            <span>MONTHLY BALANCE</span>
                            <span className={vendor.monthlyBalance < 0 ? 'text-danger' : ''}>
                                {formatCurrency(vendor.monthlyBalance)}
                            </span>
                        </div>
                        <div className="sales-row ">
                            <span>YOUR CURRENT BALANCE IS:</span>
                            <span className={vendor.currentBalance < 0 ? 'text-danger' : ''}>
                                {formatCurrency(vendor.currentBalance)}
                            </span>
                        </div>
                    </div>

                    <div className="balance-message">
                        {vendor.payments?.filter(p => p.amount > 0)[0] ? (
                            <div className="alert alert-success">
                                Your check for {formatCurrency(vendor.totalPayments)} has been processed and is enclosed.
                            </div>
                        ) : vendor.monthlyBalance < 0 ? (
                            <div className="alert alert-warning fs-6 mt-0 p-1">
                                We regret to inform you that the sales revenue did not cover the cost of the fees. Please consider this as an invoice and remit a payment of {formatCurrency(vendor.currentBalance)} to the store at your earliest convenience. Should you have any questions or require further assistance, please do not hesitate to contact the store.
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
