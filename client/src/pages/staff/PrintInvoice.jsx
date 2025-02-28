import React from 'react';
import { useGetTransactionByIdQuery } from '../../services/TransactionApi';
import { useGetSettingByKeyQuery } from '../../services/Api';
import { Container, Row, Col, Table, Spinner } from 'react-bootstrap';
import { FaPrint } from 'react-icons/fa';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router';
import './PrintInvoice.css';

export default function PrintInvoice() {
  const { id } = useParams();
  const { data: transaction, isLoading } = useGetTransactionByIdQuery(id);
  const { data: storeName } = useGetSettingByKeyQuery('Store_Name');
  const { data: storePhone } = useGetSettingByKeyQuery('Phone_Number');
  const { data: city } = useGetSettingByKeyQuery('City');
  const { data: state } = useGetSettingByKeyQuery('State');
  const { data: postalCode } = useGetSettingByKeyQuery('Postal_Code');
  const { data: storeAddress } = useGetSettingByKeyQuery('Street_Address');
  const { data: salesTaxRate } = useGetSettingByKeyQuery('Sales_Tax');
  const [searchParams] = useSearchParams();
  const hideSidebar = searchParams.get('sidebar') === 'false';

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <Spinner animation="border" className="m-5" />;
  }

  if (!transaction) {
    return <p>Transaction not found</p>;
  }

  return (
    <div className="invoice-wrapper">
      <button
        onClick={handlePrint}
        className="print-button no-print"
      >
        <FaPrint size={24} />
      </button>

      {/* Invoice Content */}
      <div className="invoice-header">
        <div className="store-info text-start">
          <h1>{storeName?.value || 'Store Name'}</h1>
          <p>
            {city?.value}, {state?.value} {postalCode?.value}<br />
            Phone: {storePhone?.value}
          </p>
        </div>
        <div className="invoice-details">
          <h2>INVOICE</h2>
          <p>
            Invoice #: {transaction.id.slice(-8)}<br />
            Date: {new Date(transaction.createdAt).toLocaleDateString()}<br />
            Time: {new Date(transaction.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <Table className="items-table">
        <thead>
          <tr>
            <th>Vendor ID</th>
            <th>Description</th>
            <th className="text-end">Quantity</th>
            <th className="text-end">Price</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
        {transaction.items.map((item, index) => (
          <tr key={index}>
            <td>{item.vendorId}</td>
            <td>{item.description}</td>
            <td className="text-end">{item.quantity}</td>
            <td className="text-end">${(item.price / 100).toFixed(2)}</td>
            <td className="text-end">${(item.total / 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </Table>

      {/* Totals Section */ }
      <div className="totals-section">
        <Table className="totals-table">
          <tbody className='text-end'>
            <tr>
              <td className=''>Subtotal:</td>
              <td className="text-end">${(transaction.subTotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Sales Tax ({salesTaxRate?.value || 7}%):</td>
              <td className="text-end">${(transaction.salesTax / 100).toFixed(2)}</td>
            </tr>
            <tr className="grand-total">
              <td>Total:</td>
              <td className="text-end">${(transaction.total / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Payment Method:</td>
              <td className="text-end">{transaction.paymentMethod}</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="invoice-footer">
        <p>Thank you for your business!</p>
      </div>
    </div >
  );
}
