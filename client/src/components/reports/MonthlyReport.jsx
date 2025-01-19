import React, { useEffect, useState } from 'react';
import { useLazyGetTransactionsQuery } from '../../services/TransactionApi';
import { useGetVendorsQuery } from '../../services/Api';
import { Table, Button } from 'react-bootstrap';

const MonthlyReport = () => {
  const [trigger, { data: transactions, error, isLoading }] = useLazyGetTransactionsQuery();
  const { data: vendors } = useGetVendorsQuery();
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    trigger({
      dateRange: {
        start: firstDayOfMonth.toISOString().split('T')[0],
        end: lastDayOfMonth.toISOString().split('T')[0],
      },
    });
  }, []);

  useEffect(() => {
    if (transactions && vendors) {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const vendorData = vendors.results.reduce((acc, vendor) => {
        const vendorName = vendor.store_name || vendor.user.name;
        acc[vendorName] = {
          totalItemsSold: 0,
          totalAmount: 0,
          totalVendorFees: 0,
          balance: vendor.balance,
          totalPayments: vendor.payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= new Date(firstDayOfMonth) && paymentDate <= new Date(lastDayOfMonth);
          }).length || 0,
        };
        return acc;
      }, {});

      transactions.results.forEach((transaction) => {
        transaction.items.forEach((item) => {
          if (vendorData[item.sold_by]) {
            vendorData[item.sold_by].totalItemsSold += item.quantity;
            vendorData[item.sold_by].totalAmount += item.total;
            vendorData[item.sold_by].totalVendorFees += item.vendor_fee;
          }
        });
      });

      const sortedReportData = Object.entries(vendorData)
        .map(([vendor, data]) => ({
          vendor,
          ...data,
        }))
        .sort((a, b) => a.vendor.localeCompare(b.vendor));

      setReportData(sortedReportData);
    }
  }, [transactions, vendors]);

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'height=400,width=800');
    printWindow.document.write('<html><head><title>Monthly Report</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(document.getElementById('monthly-report').outerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  return (
    <div>
      <h2>Monthly Report</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading transactions</p>}
      {reportData.length > 0 && (
        <div id="monthly-report">
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Total Items Sold</th>
                <th>Total Amount</th>
                <th>Total Vendor Fees</th>
                <th>Total Payments</th>
                <th>Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, index) => (
                <tr key={index}>
                  <td>{data.vendor}</td>
                  <td>{data.totalItemsSold}</td>
                  <td>{formatCurrency(data.totalAmount)}</td>
                  <td>{formatCurrency(data.totalVendorFees)}</td>
                  <td>${data.totalPayments > 0 ? data.totalPayments.toFixed(2) : '0.00'}</td>
                  <td>{formatCurrency(data.balance)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <Button onClick={handlePrintReport} className="mt-3">
        Print Report
      </Button>
    </div>
  );
};

export default MonthlyReport;
