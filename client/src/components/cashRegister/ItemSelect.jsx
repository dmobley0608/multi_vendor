import React from 'react';
import { Col, Form } from 'react-bootstrap';

// Component for selecting an item from a dropdown list based on the selected vendor
function ItemSelect({ selectedVendor, handleItemChange }) {
  return (
    <Col md="auto">
      <Form.Group>
        <Form.Label>Select Item</Form.Label>
        <Form.Control as="select" onChange={handleItemChange} id='itemSelect' required>
          <option value="">Select Item</option>
          {selectedVendor?.items?.map((item, index) => (
            <option key={index} value={item.name}>
              {item.name}: ${(item.price / 100).toFixed(2)}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    </Col>
  );
}

export default ItemSelect;
