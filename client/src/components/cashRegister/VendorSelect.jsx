import React from 'react';
import { Col, Form } from 'react-bootstrap';

// Component for selecting a vendor from a dropdown list
function VendorSelect({ vendors, handleVendorChange }) {
  return (
    <Col md="auto">
      <Form.Group controlId="vendorSelect">
        <Form.Label>Select Vendor</Form.Label>
        <Form.Control as="select" onChange={handleVendorChange} required>
          <option value="">Select Vendor</option>
          {vendors?.results?.map(vendor => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.id} - {vendor.store_name || vendor.user.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    </Col>
  );
}

export default VendorSelect;
