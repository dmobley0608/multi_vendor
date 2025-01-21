import React, { useEffect, useState } from 'react';
import { useGetVendorsQuery } from '../../services/Api';
import { useCreateTransactionMutation } from '../../services/TransactionApi';
import { Form, Button, Container, Row, Col, ListGroup, Spinner, Table, Modal } from 'react-bootstrap';
import { FaShoppingCart, FaCog, FaCaretDown } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './CashRegister.styles.css';

export default function CashRegister() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [salesTaxPercentage, setSalesTaxPercentage] = useState(localStorage.getItem('salesTaxPercentage') || 7);
  const [cardFeePercentage, setCardFeePercentage] = useState(localStorage.getItem('cardFeePercentage') || 3);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { data: vendors, isLoading } = useGetVendorsQuery();
  const [createTransaction] = useCreateTransactionMutation();

  const addItem = (item) => {
    const existingItem = items.find(i => i.vendor_item === item.id);
    if (existingItem) {
      Swal.fire("Error", "Item already added. Please update the quantity via the table.", "error");
      return;
    }
    const itemTotal = item.price * quantity;
    setItems([...items,
      {
        name:item.name,
        price:item.price,
        quantity,
        vendor_item: item.id,
        total: itemTotal,
        sold_by:item.vendor.store_name || item.vendor.user.name
      }]);
    setTotal(total + itemTotal);
    setQuantity(1);
    setSelectedItem(null);
    setSelectedVendor(null);
    console.log(items)
  };

  const handleVendorChange = (e) => {
    const vendor = vendors?.results?.find(v => v.id === parseInt(e.target.value));
    setSelectedVendor(vendor);
    setSelectedItem(null);
  };

  const handleItemChange = (e) => {
    const item = selectedVendor.items.find(i => i.name === e.target.value);
   const {name, store_name,id} = selectedVendor
    setSelectedItem({...item, vendor:{name, store_name,id}});
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].price * newQuantity;
    setItems(updatedItems);
    setTotal(updatedItems.reduce((acc, item) => acc + item.total, 0));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItem) {
      addItem(selectedItem);
    }
  };

  const handleCheckout = async () => {
    console.log(items)
    const transactionDetails = {
      items: items.map(item => ({ ...item, total: item.quantity * item.price })),
      sub_total: (subTotal * 100).toFixed(0),
      sales_tax: (salesTax * 100).toFixed(0),
      card_fee: (cardFee * 100).toFixed(0),
      grand_total: (parseFloat(subTotal + salesTax + cardFee) * 100).toFixed(0),
      payment_method: paymentMethod,
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
        window.location.reload();
      } else {
        Swal.fire("Error", "Transaction failed. Please try again.", "error");
      }
    } catch (error) {
      console.log(error)
      Swal.fire("Error", "Transaction failed. Please try again.", "error");
    }
  };

  const handleSettingsSave = () => {
    localStorage.setItem('salesTaxPercentage', salesTaxPercentage);
    localStorage.setItem('cardFeePercentage', cardFeePercentage);
    setShowSettingsModal(false);
  };

  const subTotal = total / 100;
  const salesTax = subTotal * (salesTaxPercentage / 100); // using sales tax percentage from state
  const cardFee = paymentMethod === 'CARD' ? subTotal * (cardFeePercentage / 100) : 0; // using card fee percentage from state

  useEffect(() => { }, [vendors, selectedVendor, selectedItem, items, total, paymentMethod, salesTaxPercentage, cardFeePercentage]);

  return (
    <Container className='p-3'>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Cash Register</h1>
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
                <Form.Label>Select Vendor</Form.Label>
                <Form.Control as="select" onChange={handleVendorChange} value={selectedVendor?.id || ''} required>
                  <option value="">Select Vendor</option>
                  {vendors?.results?.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.id} - {vendor.store_name || vendor.user.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md="auto">
              <Form.Group controlId="itemSelect">
                <Form.Label>Select Item</Form.Label>
                <Form.Control as="select" onChange={handleItemChange} value={selectedItem?.name || ''} required>
                  <option value="">Select Item</option>
                  {selectedVendor?.items?.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}: ${(item.price / 100).toFixed(2)}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md="auto">
              <Form.Group controlId="quantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
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
                  <td>{item?.sold_by}</td>
                  <td>{item.name}</td>
                  <td style={{ width: '100px' }}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onFocus={(e) => e.target.value=''}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      onBlur={(e)=>{if(!e.target.value) e.target.value=item.quantity}}
                      required
                    />
                  </td>
                  <td>${(item.price / 100).toFixed(2)}</td>
                  <td>${((item.price * item.quantity) / 100).toFixed(2)}</td>
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
              {paymentMethod === 'CARD' && (
                <tr>
                  <td colSpan='4' className="text-end fw-bold">Card Fee ({cardFeePercentage}%)</td>
                  <td className="fw-bold">${cardFee.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="text-end fw-bold">Payment Method</td>
                <td>
                  <div className="d-flex  align-items-center">

                    <Form.Control id='paymentMethod' as="select" value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <option value="CASH">CASH</option>
                      <option value="CARD">CARD</option>
                    </Form.Control>
                    <Form.Label htmlFor='paymentMethod' className="p-0 bg-white"><FaCaretDown className='no-print' style={{marginLeft:'-25px'}}/></Form.Label>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end fw-bold">Total</td>
                <td className="fw-bold">${(subTotal + salesTax + cardFee).toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
          <div className="d-flex justify-content-end no-print">
            <Button variant="success" onClick={handleCheckout}>
              <FaShoppingCart className="me-2" />
              Checkout
            </Button>
          </div>
        </Col>
      </Row>

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
            <Form.Group controlId="cardFeePercentage">
              <Form.Label>Card Fee Percentage</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={cardFeePercentage}
                onChange={(e) => setCardFeePercentage(parseFloat(e.target.value))}
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
