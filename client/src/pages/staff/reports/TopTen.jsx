import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form } from 'react-bootstrap';
import { useGetTransactionsQuery } from '../../../services/TransactionApi';
import { useLoading } from '../../../context/loadingContext';

const TopTen = () => {
  const [period, setPeriod] = useState('all');
  const { data: transactionData, isLoading } = useGetTransactionsQuery();
  const {showLoading, hideLoading} = useLoading();
  const calculateTopVendors = () => {
    if (!transactionData?.transactions) return [];

    const vendorTotals = new Map();
    const now = new Date();

    const filteredTransactions = transactionData.transactions.filter(transaction => {
      const transDate = new Date(transaction.createdAt);
      switch (period) {
        case 'daily':
          return transDate.toDateString() === now.toDateString();
        case 'weekly':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return transDate >= weekAgo;
        case 'monthly':
          return transDate.getMonth() === now.getMonth() &&
            transDate.getFullYear() === now.getFullYear();
        case 'yearly':
          return transDate.getFullYear() === now.getFullYear();
        default: // all time
          return true;
      }
    });

    // Calculate totals for each vendor
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const current = vendorTotals.get(item.vendorId) || {
          vendorId: item.vendorId,
          vendorName: item.vendor.fullName,
          totalSales: 0,
          itemCount: 0
        };

        current.totalSales += item.total;
        current.itemCount += item.quantity;
        vendorTotals.set(item.vendorId, current);
      });
    });

    return Array.from(vendorTotals.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
  };

  const topVendors = calculateTopVendors();

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return "Today's";
      case 'weekly': return "This Week's";
      case 'monthly': return "This Month's";
      case 'yearly': return "This Year's";
      default: return "All Time";
    }
  };

    useEffect(() => {
          if(isLoading){
              showLoading('Calculating Top 10...')
          }else{
              hideLoading()
          }
       },[isLoading])

  if (isLoading) return <div></div>;

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col md={8}>
          <h2>{getPeriodLabel()} Top 10 Vendors</h2>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Period</Form.Label>
            <Form.Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Items Sold</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((vendor, index) => (
                <tr key={vendor.vendorId}>
                  <td>{index + 1}</td>
                  <td>{vendor.vendorId}</td>
                  <td>{vendor.vendorName}</td>
                  <td>{vendor.itemCount}</td>
                  <td>${(vendor.totalSales / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TopTen;
