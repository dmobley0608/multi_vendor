import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';

// Component for the checkout button with loading spinner and disabled state
function CheckoutButton({ handleCheckout, isTransactionLoading, disabled }) {
  return (
    <Button variant="success" onClick={handleCheckout} disabled={isTransactionLoading || disabled}>
      {isTransactionLoading ? <Spinner animation="border" size="sm" /> : <FaShoppingCart className="me-2" />}
      Checkout
    </Button>
  );
}

export default CheckoutButton;
