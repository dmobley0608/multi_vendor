import React, { useEffect, useState } from 'react';
import { useGetSettingByKeyQuery, useGetVendorMonthlyReportQuery } from '../../../services/Api';
import { Table, Button, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import BoothChargeActions from '../../../components/boothCharges/BoothChargeActions';
import PaymentActions from '../../../components/payments/PaymentActions';
import Swal from 'sweetalert2';
import { useLoading } from '../../../context/loadingContext';

const MonthlySalesSummary = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedVendor, setSelectedVendor] = useState('');
  const { data: monthlyReport, isLoading, refetch } = useGetVendorMonthlyReportQuery({
    year: selectedYear,
    month: selectedMonth
  });
  const { showLoading, hideLoading } = useLoading();

  const { data: commissionSetting } = useGetSettingByKeyQuery('Store_Commission');
  const { data: salesTaxRate } = useGetSettingByKeyQuery('Sales_Tax');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }));

  const formatCurrency = (amount) => `$${(amount / 100).toFixed(2)}`;

  const handlePrintReport = () => {
    const monthName = months.find(m => m.value === selectedMonth).label;
    const printWindow = window.open(
      `/staff/reports/monthly/${selectedYear}/${selectedMonth}?month=${monthName}&year=${selectedYear}&sidebar=false`,
      'PrintWindow',
      'width=1000,height=800'
    );
    printWindow.focus();
  };

  const handlePrintVendorReport = () => {
    if (!selectedVendor) {
      Swal.fire('Error', 'Please select a vendor', 'error');
      return;
    }

    const monthName = months.find(m => m.value === selectedMonth).label;
    const vendor = monthlyReport.vendors.find(v => v.id === parseInt(selectedVendor));

    const printWindow = window.open(
      `/staff/reports/monthly/vendor/${selectedYear}/${selectedMonth}/${selectedVendor}?month=${monthName}&year=${selectedYear}&vendor=${vendor.firstName} ${vendor.lastName}&sidebar=false`,
      'PrintWindow',
      'width=1000,height=800'
    );
    printWindow.focus();
  };

  // Calculate totals for summary
  const getCurrentMonthCharge = (charges) => {

    return charges?.find(charge =>
      charge.year === selectedYear &&
      charge.month === selectedMonth
    );
  };

  // Add previousBalance to totals calculation
  const getTotals = () => {
    if (!monthlyReport?.vendors) return {};

    return monthlyReport.vendors.reduce((acc, vendor) => ({
      totalTransactions: acc.totalTransactions + vendor.totalItems,
      totalSales: acc.totalSales + vendor.totalSales,
      totalCommission: acc.totalCommission + vendor.storeCommission,
      totalPayments: acc.totalPayments + vendor.totalPayments,
      totalBoothRental: acc.totalBoothRental + (getCurrentMonthCharge(vendor.boothRentalCharges)?.amount || 0),
      totalMonthlyEarnings: acc.totalMonthlyEarnings + (vendor.monthlyEarnings || 0),
      totalPreviousBalance: acc.totalPreviousBalance + (vendor.monthlyBalance - vendor.currentBalance)
    }), {
      totalTransactions: 0,
      totalSales: 0,
      totalCommission: 0,
      totalPayments: 0,
      totalBoothRental: 0,
      totalMonthlyEarnings: 0,
      totalPreviousBalance: 0
    });
  };

  const totals = getTotals();

  // Find current month's booth charge and payment
  const getCurrentMonthPayment = (payments) => {
    if (!payments || !Array.isArray(payments)) return null;

    const currentPayment = payments.find(payment =>
      payment.year === selectedYear &&
      payment.month === selectedMonth
    );

    return currentPayment ? {
      id: currentPayment.id,
      amount: currentPayment.amount,
      createdAt: currentPayment.createdAt,
      status: 'Paid'
    } : null;
  };

  // Create a sorted copy of vendors array
  const sortedVendors = monthlyReport?.vendors
    ? [...monthlyReport.vendors].sort((a, b) => a.id - b.id)
    : [];

  useEffect(() => {
    const fetchReport = async () => {
      showLoading('Loading report data...');
      await refetch();
      hideLoading();
    }
    fetchReport();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="p-3">
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button onClick={handlePrintReport} className="w-100">
                Print Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading report data...</p>
        </div>
      ) : (
        <>
          <Row>
            <Col>
              <Card className="mb-4" style={{ maxWidth: '500px' }}>
                <Card.Body>
                  <Row>
                    <Col>
                      <h6>Monthly Summary</h6>
                      <Table size="sm" borderless striped>
                        <tbody className='text-start'>
                          <tr>
                            <td>Total Transactions:</td>
                            <td>{totals.totalTransactions || 0}</td>
                          </tr>
                          <tr>
                            <td>Total Sales:</td>
                            <td>{formatCurrency(totals.totalSales || 0)}</td>
                          </tr>
                          <tr>
                            <td>Total Sales Tax:</td>
                            <td>{formatCurrency(totals.totalSales * parseFloat(salesTaxRate?.value / 100).toFixed(2) || 0)}</td>
                          </tr>
                          <tr>
                            <td>Commission Rate:</td>
                            <td>{parseFloat(commissionSetting?.value)}%</td>
                          </tr>
                          <tr>
                            <td>Total Store Commission:</td>
                            <td>{formatCurrency(totals.totalCommission || 0)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="mb-4" style={{ maxWidth: '500px' }}>
                <Card.Body>
                  <h6>Vendor Monthly Sales Report</h6>
                  <Row className="mt-3">
                    <Col>
                      <Form.Group>
                        <Form.Label>Select Vendor</Form.Label>
                        <Form.Select
                          value={selectedVendor}
                          onChange={(e) => setSelectedVendor(e.target.value)}
                        >
                          <option value="">Select Vendor</option>
                          {sortedVendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.id} - {vendor.firstName} {vendor.lastName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <div className="mt-3">
                        <Button
                          onClick={handlePrintVendorReport}
                          className="w-100"
                          disabled={!selectedVendor}
                        >
                          Print Vendor Report
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Table striped bordered responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cash Sales</th>
                <th>Card Sales</th>
                <th>Total Sales</th>
                <th>Store Commission</th>
                <th>Monthly Earnings</th>
                <th>Booth Rent</th>
                <th>Previous Balance</th>
                <th>Monthly Balance</th>
                <th>Current Balance</th>
                <th>Payment Amount Sent</th>
              </tr>
            </thead>
            <tbody>
              {sortedVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.id}</td>
                  <td>{formatCurrency(vendor.cashSales)}</td>
                  <td>{formatCurrency(vendor.cardSales)}</td>
                  <td>{formatCurrency(vendor.totalSales)}</td>
                  <td>{formatCurrency(vendor.storeCommission)}</td>
                  <td>{formatCurrency(vendor.monthlyEarnings)}</td>
                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{formatCurrency(getCurrentMonthCharge(vendor.boothRentalCharges)?.amount || 0)}</span>
                      <BoothChargeActions
                        vendorId={vendor.id}
                        boothCharge={getCurrentMonthCharge(vendor.boothRentalCharges)}
                        year={selectedYear}
                        month={selectedMonth}
                        onChargeUpdated={refetch}
                      />
                    </div>
                  </td>


                  <td className={vendor.previousBalance < 0 ? 'text-danger' : ''}>
                    {formatCurrency(vendor.previousBalance)}
                  </td>
                  <td className={vendor.monthlyBalance < 0 ? 'text-danger' : ''}>
                    {formatCurrency(vendor.monthlyBalance)}
                  </td>

                  <td className={vendor.currentBalance < 0 ? 'text-danger' : ''}>
                    {formatCurrency(vendor.currentBalance)}
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{formatCurrency(vendor.totalPayments)}</span>
                      <PaymentActions
                        vendorId={vendor.id}
                        payment={getCurrentMonthPayment(vendor.payments)}
                        grossProfit={(vendor.monthlyBalance)}
                        currentBalance={vendor.currentBalance}
                        year={selectedYear}
                        month={selectedMonth}
                        onPaymentCreated={refetch}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default MonthlySalesSummary;
