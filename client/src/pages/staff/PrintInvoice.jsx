import React, { useEffect, useState } from 'react';

import { useGetTransactionByIdQuery } from '../../services/TransactionApi';
import { Container, Row, Col, Table, Spinner, Button } from 'react-bootstrap';
import './PrintInvoice.styles.css';
import { useParams } from 'react-router';

export default function PrintInvoice() {
  const { id } = useParams();
  const { data: transaction, isLoading } = useGetTransactionByIdQuery(id);

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  if (!transaction) {
    return <p>Transaction not found</p>;
  }

  const { items, sub_total, sales_tax, card_fee, grand_total, payment_method, date } = transaction;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Container className='p-3'>
      <h1>Invoice</h1>
      <Row>
        <Col className="text-start">
          <p><strong>Transaction ID:</strong> {id}</p>
          <p><strong>Date:</strong> {formattedDate} {formattedTime}</p>
        </Col>
      </Row>
      <Row className='invoice'>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.sold_by}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price / 100).toFixed(2)}</td>
                  <td>${((item.price * item.quantity) / 100).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="text-end fw-bold">Sub Total</td>
                <td className="fw-bold">${(sub_total / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Sales Tax</td>
                <td className="fw-bold">${(sales_tax / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Payment Method</td>
                <td className="fw-bold">{payment_method}</td>
              </tr>
              {payment_method === 'CARD' && (
                <tr>
                  <td colSpan='4' className="text-end fw-bold">Card Fee</td>
                  <td className="fw-bold">${(card_fee / 100).toFixed(2)}</td>
                </tr>
              )}

              <tr>
                <td colSpan="4" className="text-end fw-bold">Total</td>
                <td className="fw-bold">${(grand_total / 100).toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Button onClick={() => window.print()} className='no-print'>Print</Button>
    </Container>
  );
}
