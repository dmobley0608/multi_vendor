import React from 'react';
import { Col, Form } from 'react-bootstrap';

// Component for inputting the quantity of the selected item
function QuantityInput({ quantity, setQuantity }) {
  return (
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
  );
}

export default QuantityInput;
