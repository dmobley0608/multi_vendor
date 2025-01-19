import React from 'react';
import { Table, FormControl, Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

// Component for displaying the invoice table with items, subtotal, sales tax, card fee, and total
function InvoiceTable({ items, subTotal, salesTax, cardFee, paymentMethod, handleRemoveItem, handleQuantityChange, handlePriceInputChange, handlePaymentMethodChange }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.vendor.store_name || item.vendor.user.name}</td>
            <td>{item.name}</td>
            <td>
              <FormControl
                type="number"
                min="1"
                defaultValue={item.quantity}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                style={{ width: '60px' }}
              />
            </td>
            <td>
              <FormControl
                type="text"
                defaultValue={(item.price / 100).toFixed(2)}
                onChange={(e) => handlePriceInputChange(index, e.target.value)}
                style={{ width: '80px' }}
              />
            </td>
            <td>${((item.price * item.quantity) / 100).toFixed(2)}</td>
            <td>
              <FaTrash className='no-print' onClick={() => handleRemoveItem(index)} style={{ cursor: 'pointer', fontSize: '12px' }} />
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="5" className="text-end fw-bold">Sub Total</td>
          <td className="fw-bold">${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="5" className="text-end fw-bold">Sales Tax</td>
          <td className="fw-bold">${salesTax.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="5" className="text-end fw-bold">Payment Method</td>
          <td>
            <Form.Select value={paymentMethod} onChange={handlePaymentMethodChange}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </Form.Select>
          </td>
        </tr>
        {paymentMethod === 'CARD' && (
          <tr>
            <td colSpan='5' className="text-end fw-bold">Card Fee</td>
            <td className="fw-bold">${cardFee.toFixed(2)}</td>
          </tr>
        )}

        <tr>
          <td colSpan="5" className="text-end fw-bold">Total</td>
          <td className="fw-bold">${(subTotal + salesTax + cardFee).toFixed(2)}</td>
        </tr>
      </tbody>
    </Table>
  );
}

export default InvoiceTable;
