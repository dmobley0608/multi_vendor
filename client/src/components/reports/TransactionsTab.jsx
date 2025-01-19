import React, { useEffect, useState } from 'react';
import { useLazyGetTransactionsQuery } from '../../services/TransactionApi';
import { useGetVendorItemsQuery } from '../../services/Api';
import { Form, Button, Table, Collapse, Row, Col, Modal } from 'react-bootstrap';
import { FaPrint, FaFilter } from 'react-icons/fa';


const TransactionsTab = () => {
  const [item, setItem] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({ item: '', dateRange: { start: '', end: '' } });
  const [trigger, { data: transactions, error, isLoading }] = useLazyGetTransactionsQuery();
  const { data: vendorItems } = useGetVendorItemsQuery();
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (transactions) {
      setFilteredTransactions(transactions.results);
    }
  }, [transactions]);

  const handleFilter = (e) => {
    e.preventDefault();
    let filtered = transactions.results;

    if (item) {
      filtered = filtered.filter((transaction) =>
        transaction.items.some((transactionItem) => transactionItem.vendor_item === parseInt(item))
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter((transaction) =>{
        return new Date(transaction.date) >= new Date(dateRange.start)
      }
      );
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      filtered = filtered.filter((transaction) =>
        new Date(transaction.date) <= endDate
      );
    }

    setFilteredTransactions(filtered);
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handlePrintInvoice = (id) => {
    window.open(`/print-invoice/${id}`, id, "width=800,height=500");
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(!open)}
        aria-controls="filter-form"
        aria-expanded={open}
        className='my-3'
        variant='link'
        style={{ backgroundColor: 'transparent' }}
      >
        <FaFilter /> {open ? 'Hide Filters' : 'Show Filters'}
      </Button>
      <Collapse in={open}>
        <div id="filter-form">
          <Form onSubmit={handleFilter}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="item">
                  <Form.Label>Item</Form.Label>
                  <Form.Control as="select" value={item} onChange={(e) => setItem(e.target.value)}>
                    <option value="">Select Item</option>
                    {vendorItems?.results?.map((vendorItem) => (
                      <option key={vendorItem.id} value={vendorItem.id}>
                        {vendorItem.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="dateRangeStart">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="dateRangeEnd">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant='link' style={{ backgroundColor: 'transparent' }}>Filter</Button>
          </Form>
        </div>
      </Collapse>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading transactions</p>}
      {Array.isArray(filteredTransactions) && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Sub Total</th>
              <th>Sales Tax</th>
              <th>Card Fee</th>
              <th>Grand Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} style={{ fontSize: '0.875rem', fontWeight: 'normal', cursor: 'pointer' }} onClick={() => handleRowClick(transaction)}>
                <td>{transaction.id}</td>
                <td>{formatDateTime(transaction.date)}</td>
                <td>{transaction.payment_method}</td>
                <td>${transaction?.sub_total / 100}</td>
                <td>${transaction?.sales_tax / 100}</td>
                <td>${transaction?.card_fee > 0 ? transaction.card_fee / 100 : '0.00'}</td>
                <td>${transaction?.grand_total / 100}</td>
                <td>
                  <Button variant="link" style={{ backgroundColor: 'transparent' }} onClick={(e) => { e.stopPropagation(); handlePrintInvoice(transaction.id); }}>
                    <FaPrint />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <div>
              <p><strong>ID:</strong> {selectedTransaction.id}</p>
              <p><strong>Date:</strong> {formatDateTime(selectedTransaction.date)}</p>
              <p><strong>Payment Method:</strong> {selectedTransaction.payment_method}</p>
              <p><strong>Sub Total:</strong> ${selectedTransaction?.sub_total / 100}</p>
              <p><strong>Sales Tax:</strong> ${selectedTransaction?.sales_tax / 100}</p>
              <p><strong>Card Fee:</strong> ${selectedTransaction?.card_fee > 0 ? selectedTransaction.card_fee / 100 : '0.00'}</p>
              <p><strong>Grand Total:</strong> ${selectedTransaction?.grand_total / 100}</p>
              <p><strong>Items:</strong></p>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Sold By</th>
                    <th>Vendor Fee</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price / 100}</td>
                      <td>{item.quantity}</td>
                      <td>{item.sold_by}</td>
                      <td>${item.vendor_fee / 100}</td>
                      <td>${item.total / 100}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransactionsTab;
