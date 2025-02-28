import React, { useEffect, useState } from 'react';
import { useGetVendorsQuery, useGetSettingByKeyQuery, useUpdateSettingByKeyMutation } from '../../services/Api';
import { useCreateTransactionMutation, useGetDailyTransactionsQuery, useUpdateTransactionMutation, useDeleteTransactionMutation } from '../../services/TransactionApi';
import { Form, Button, Container, Row, Col, ListGroup, Spinner, Table, Modal, Pagination } from 'react-bootstrap';
import { FaShoppingCart, FaCog, FaCaretDown, FaEdit, FaTrash, FaEye, FaTimes, FaCalculator } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './CashRegister.styles.css';
import TransactionsTable from '../../components/tables/TransactionsTable';

export default function CashRegister() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    vendorId: '',
    description: '',
    price: '',
    quantity: 1
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const { data: salesTaxSetting } = useGetSettingByKeyQuery('Sales_Tax');
  const [updateSetting] = useUpdateSettingByKeyMutation();
  const [salesTaxPercentage, setSalesTaxPercentage] = useState(7); // default value
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { data: vendors, isLoading } = useGetVendorsQuery();
  const [createTransaction] = useCreateTransactionMutation();
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const transactionsPerPage = 10;
  const { data: dailyTransactions } = useGetDailyTransactionsQuery();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  const resetTransaction = () => {
    setItems([]);
    setTotal(0);
    setPaymentMethod('CASH');
  };

  const addItem = () => {
    const price = parseFloat(formData.price);
    const itemTotal = price * formData.quantity;
    setItems([...items, {
      price: price,
      quantity: parseInt(formData.quantity),
      description: formData.description,
      total: itemTotal,
      vendorId: formData.vendorId
    }]);

    setTotal(prev => prev + itemTotal);
    setFormData({
      vendorId: '',
      description: '',
      price: '',
      quantity: 1
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem();
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].price * newQuantity;
    setItems(updatedItems);
    setTotal(updatedItems.reduce((acc, item) => acc + item.total, 0));
  };

  const handleDescriptionChange = (index, newDescription) => {
    const updatedItems = [...items];
    updatedItems[index].description = newDescription;
    setItems(updatedItems);
  };



  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const transactionDetails = {
      items: items.map(item => ({
        ...item,
        price: Math.round(item.price * 100),
        total: Math.round(item.total * 100)
      })),
      salesTax: Math.round(salesTax * 100),
      paymentMethod: paymentMethod,
    };

    try {
      const response = await createTransaction(transactionDetails).unwrap();

      if (response) {
        const { isConfirmed } = await Swal.fire({
          title: "Success",
          text: "Transaction completed successfully. Do you want to print the invoice?",
          icon: "success",
          showCancelButton: true,
          cancelButtonText: "No Thanks",
        });

        if (isConfirmed) {
          window.open(`print-invoice/${response.id}/?sidebar=false`, response.id, "width=800,height=500");
        }

        // Reset transaction after success
        resetTransaction();
      } else {
        Swal.fire("Error", "Transaction failed. Please try again.", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Transaction failed. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      await updateSetting({
        key: 'Sales_Tax',
        value: salesTaxPercentage.toString()
      }).unwrap();

      Swal.fire({
        title: 'Success',
        text: 'Sales tax updated successfully',
        icon: 'success'
      });
      setShowSettingsModal(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update sales tax',
        icon: 'error'
      });
    }
  };

  const handleRemoveItem = (index, itemTotal) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setTotal(prev => prev - itemTotal);
  };

  const subTotal = total;
  const salesTax = subTotal * (salesTaxPercentage / 100);

  useEffect(() => {
    if (salesTaxSetting?.value) {
      setSalesTaxPercentage(parseFloat(salesTaxSetting.value));
    }
  }, [salesTaxSetting]);

  // Updated pagination logic for new response structure
  const indexOfLastTransaction = currentHistoryPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = dailyTransactions?.transactions?.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil((dailyTransactions?.count || 0) / transactionsPerPage);

  const handleCalculatorOpen = () => {
    setAmountReceived('');
    setChangeDue(0);
    setShowCalculator(true);
  };

  return (
    <Container className='p-3'>
      <div className="d-flex justify-content-between align-items-center">
        <Button variant="" onClick={() => setShowSettingsModal(true)}>
          <FaCog size={24} />
        </Button>
      </div>
      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        <Form onSubmit={handleSubmit} className='no-print'>
          <Row className='align-items-center justify-content-center'>
            <Col md="auto">
              <Form.Group controlId="vendorSelect">
                <Form.Label>Vendor ID</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  required
                >
                  <option value="">Select Vendor ID</option>
                  {vendors?.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.id}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md="auto">
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type='text'
                  value={formData.description}
                  onFocus={(e) => e.target.value = ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={(e) => { if (!e.target.value) e.target.value = formData.description }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onFocus={(e) => e.target.value = ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  onBlur={(e) => { if (!e.target.value) e.target.value = formData.price }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Form.Group controlId="quantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onFocus={(e) => e.target.value = ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  onBlur={(e) => { if (!e.target.value) e.target.value = formData.quantity }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button type="submit" className="mt-4">Add Item</Button>
            </Col>
          </Row>
        </Form>
      )}
      <Row className='invoice' id='invoice'>
        <Col>
          <h2>Invoice</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.vendorId}</td>
                  <td style={{ width: '200px' }}>
                    <Form.Control
                      type="text"
                      value={item.description}
                      onFocus={(e) => e.target.value = ''}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      onBlur={(e) => { if (!e.target.value) e.target.value = item.description }}
                      required
                    />
                  </td>
                  <td style={{ width: '100px' }}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onFocus={(e) => e.target.value = ''}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      onBlur={(e) => { if (!e.target.value) e.target.value = item.quantity }}
                      required
                    />
                  </td>
                  <td style={{ width: '100px' }}>
                    ${parseFloat(item.price).toFixed(2)}
                  </td>
                  <td>${(item.total).toFixed(2)}</td>
                  <td>
                    <Button
                      variant=""
                      onClick={() => handleRemoveItem(index, item.total)}
                    >
                      <FaTimes size='1em' color='red' />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="text-end fw-bold">Sub Total</td>
                <td className="fw-bold">${subTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Sales Tax ({salesTaxPercentage}%)</td>
                <td className="fw-bold">${salesTax.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Payment Method</td>
                <td>
                  <div className="d-flex  align-items-center">

                    <Form.Control id='paymentMethod' as="select" value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <option value="CASH">CASH</option>
                      <option value="CARD">CARD</option>
                    </Form.Control>
                    <Form.Label htmlFor='paymentMethod' className="p-0 bg-white"><FaCaretDown className='no-print' style={{ marginLeft: '-25px' }} /></Form.Label>
                    {paymentMethod === 'CASH' && (
                      <Button
                        variant="link"
                        className="ms-2 no-print"
                        onClick={handleCalculatorOpen}
                      >
                        <FaCalculator />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Total</td>
                <td className="fw-bold">${(subTotal + salesTax).toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
          <div className="d-flex justify-content-end no-print">
            <Button
              variant="success"
              onClick={handleCheckout}
              disabled={isCheckingOut || items.length === 0}
            >
              {isCheckingOut ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FaShoppingCart className="me-2" />
                  Checkout
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      <Modal show={showCalculator} onHide={() => setShowCalculator(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Calculate Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="text"
                value={`$${(subTotal + salesTax).toFixed(2)}`}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount Received</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => {
                  setAmountReceived(e.target.value);
                  const received = parseFloat(e.target.value);
                  const total = subTotal + salesTax;
                  setChangeDue(received ? received - total : 0);
                }}
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Change Due</Form.Label>
              <Form.Control
                type="text"
                value={changeDue >= 0 ? `$${changeDue.toFixed(2)}` : 'Insufficient amount'}
                className={changeDue >= 0 ? 'text-success' : 'text-danger'}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCalculator(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="salesTaxPercentage">
              <Form.Label>Sales Tax Percentage</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={salesTaxPercentage}
                onChange={(e) => setSalesTaxPercentage(parseFloat(e.target.value))}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSettingsSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
