import React from 'react';
import { useGetTransactionByIdQuery } from '../../services/TransactionApi';

const PrintInvoice = ({ transactionId }) => {
  const { data: transaction, error, isLoading } = useGetTransactionByIdQuery(transactionId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading transaction</p>;

  return (
    <div>
      <h1>Invoice</h1>
      {/* Render transaction details */}
      <p>Transaction ID: {transaction.id}</p>
      <p>Vendor: {transaction.vendor}</p>
      <p>Item: {transaction.item}</p>
      <p>Quantity: {transaction.quantity}</p>
      <p>Total: {transaction.total}</p>
    </div>
  );
};

export default PrintInvoice;
