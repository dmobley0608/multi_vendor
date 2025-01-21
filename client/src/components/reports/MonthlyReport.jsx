import React, { useEffect, useState } from 'react';
import { useLazyGetTransactionsQuery } from '../../services/TransactionApi';
import { useGetVendorsQuery } from '../../services/Api';
import { Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
        acc[vendor.id] = {
          vendorName: vendor.store_name || vendor.user.name,
          totalItemsSold: 0,
          totalAmount: 0,
          totalVendorFees: 0,
          balance: vendor.balance,
          totalPayments: vendor.payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= new Date(firstDayOfMonth) && paymentDate <= new Date(lastDayOfMonth);
          }).length || 0,
          payments:vendor.payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= new Date(firstDayOfMonth) && paymentDate <= new Date(lastDayOfMonth);
          }),
        };
        return acc;
      }, {});

      transactions.results.forEach((transaction) => {
        transaction.items.forEach((item) => {
          let items = vendors.results.reduce((acc=[], vendor)=>[...acc, ...vendor?.items], [])
          const vendor_item = items?.filter(i => i.id == item.vendor_item)[0]
          if (vendor_item && vendorData[vendor_item?.vendor]) {
            console.log(vendorData)
            vendorData[vendor_item.vendor].totalItemsSold += item.quantity;
            vendorData[vendor_item.vendor].totalAmount += item.total;
            vendorData[vendor_item.vendor].totalVendorFees += item.vendor_fee;
          }
        });
      });


      const sortedReportData = Object.entries(vendorData)
        .map(([vendorId, data]) => ({
          vendorId,
          ...data,
        }))
        .sort((a, b) => a.vendorName.localeCompare(b.vendorName));

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

  const renderTooltip = (payments) => {
    console.log(payments)
    return(
    <Tooltip>
      <ul className="list-unstyled mb-0">
        {payments?.map((payment, index) => (
          <li key={index}>{new Date(payment.date).toLocaleDateString()}: {formatCurrency(payment.amount)}</li>
        ))}
      </ul>
    </Tooltip>
  )};

  return (
    <div>

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
              {reportData?.map((data, index) => (
                <tr key={index}>
                  <td>{data.vendorName}</td>
                  <td>{data.totalItemsSold}</td>
                  <td>{formatCurrency(data.totalAmount)}</td>
                  <td>{formatCurrency(data.totalVendorFees)}</td>
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(data?.payments)}
                  >
                    <td>{data.totalPayments}</td>
                  </OverlayTrigger>
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
