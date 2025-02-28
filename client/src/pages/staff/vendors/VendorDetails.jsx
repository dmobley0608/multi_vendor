import React, { useEffect, useState } from 'react';
import { Col, Container, Stack, Button, Row, Form, Tabs, Tab } from 'react-bootstrap';
import { useParams } from 'react-router';
import { useGetVendorByIdQuery, useUpdateVendorBalanceMutation, useCreatePaymentMutation, useCreateBalancePaymentMutation, useResetVendorPasswordMutation } from '../../../services/Api';
import { format } from 'date-fns';
import { FaEdit, FaMoneyBillWave, FaPassport } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import AddVendorForm from '../../../components/forms/vendor/AddVendorForm';
import { useAuth } from '../../../context/authContext';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router';
import VendorPaymentsTable from '../../../components/tables/VendorPaymentsTable';
import VendorBoothChargesTable from '../../../components/tables/VendorBoothChargesTable';
import VendorBalancePaymentsTable from '../../../components/tables/VendorBalancePaymentsTable';
import { MdOutlineLockReset } from 'react-icons/md';
import { useLoading } from '../../../context/loadingContext';

export default function VendorDetails() {
  const { id } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const { data: vendor, isLoading, error } = useGetVendorByIdQuery(id);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [updateBalance] = useUpdateVendorBalanceMutation();
  const { user } = useAuth();
  const [balanceAmount, setBalanceAmount] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'payments';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Check');
  const [createPayment] = useCreatePaymentMutation();
  const [createBalancePayment] = useCreateBalancePaymentMutation();
  const [resetPassword] = useResetVendorPasswordMutation();
  const {showLoading, hideLoading} = useLoading();


  const handleResetPassword = async () => {

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will reset the vendor password',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'No, cancel!'
      })
        if (result.isConfirmed) {
         showLoading('Resetting password...');
          const res = await resetPassword(vendor.userId).unwrap();
          if (res) {

            await Swal.fire('Success', 'Password reset successfully', 'success');
          }
        }

    } catch (error) {
      await Swal.fire('Error', 'Failed to reset password', 'error');
    }finally{
      hideLoading();
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
     showLoading('Processing payment...');

      const result = await createBalancePayment({
        vendorId: vendor.id,
        amount: Math.round(parseFloat(paymentAmount) * 100),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod,
        description: paymentDescription.trim()
      }).unwrap();

      if (result) {

        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentDescription('');
        setPaymentMethod('Check');
        await Swal.fire('Success', 'Payment processed successfully', 'success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      await Swal.fire('Error', 'Failed to process payment', 'error');
    }finally{
      hideLoading();
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

    useEffect(() => {
          if(isLoading){
              showLoading('Loading Vendor Details...')
          }else{
              hideLoading()
          }
       },[isLoading])

  if (isLoading) return ''
  if (error) return <p>Error: {error.message}</p>

  return (
    <Container className="py-4">
      {/* Header section */}
      <Row className="mb-4">
        <Col className="d-flex align-items-center gap-3 justify-content-center">
          <div>
            <h1 className="mb-0">Vendor Details</h1>
            <small className="text-muted">ID: {vendor?.id}</small>
          </div>
          <Button
            variant=""
            className='icon-font-size'
            onClick={() => setShowEditModal(true)}
          >
            <FaEdit />
          </Button>
        </Col>
      </Row>

      {/* Vendor information section */}
      <Row className="g-4">
        <Col sm={12} md={6}>
          <Stack gap={3} className="text-start">
            <div>
              <h5 className="border-bottom pb-2">Personal Information</h5>
              <p className="mb-1"><strong>Name:</strong> {vendor?.firstName} {vendor?.lastName}</p>
              <p className="mb-1"><strong>Username:</strong> {vendor?.user?.username}</p>
              <p className="mb-1"><strong>Email:</strong> {vendor?.user?.email}</p>
              <p className="mb-1"><strong>Reset Password:</strong>
                <Button size='sm' variant='outline-danger' title='Reset Password' onClick={handleResetPassword} className='ms-3'>
                  <MdOutlineLockReset />
                </Button>
              </p>
            </div>

            <div>
              <h5 className="border-bottom pb-2">Contact Information</h5>
              <p className="mb-1"><strong>Primary Phone:</strong> {vendor?.phoneNumber || 'N/A'}</p>
              <p className="mb-1"><strong>Alternate Phone:</strong> {vendor?.alternateNumber || 'N/A'}</p>
            </div>

            <div>
              <h5 className="border-bottom pb-2">Address</h5>
              <p className="mb-1">{vendor?.streetAddress}</p>
              <p className="mb-1">
                {vendor?.city}, {vendor?.state} {vendor?.postalCode}
              </p>
            </div>

            {user?.isStaff && (
              <div>
                <h5 className="border-bottom pb-2">Financial Information</h5>
                <p className="mb-1">
                  <strong>Current Balance:</strong> ${(vendor?.balance / 100).toFixed(2)}
                  {vendor?.balance < 0 && (
                    <Button
                      variant="success"
                      size="sm"
                      className="ms-2"
                      onClick={() => {
                        setPaymentAmount((Math.abs(vendor.balance) / 100).toFixed(2));
                        setShowPaymentModal(true);
                      }}
                    >
                      <FaMoneyBillWave className="me-2" />
                      Add Payment
                    </Button>
                  )}
                </p>
              </div>
            )}
          </Stack>
        </Col>

        <Col sm={12} md={6}>
          <Stack gap={3} className="text-start">
            <div>
              <h5 className="border-bottom pb-2">Account Details</h5>
              <p className="mb-1"><strong>User ID:</strong> {vendor?.userId}</p>
              <p className="mb-1">
                <strong>Created:</strong>{' '}
                {vendor?.createdAt ? format(new Date(vendor.createdAt), 'PPpp') : 'N/A'}
              </p>
              <p className="mb-1">
                <strong>Last Updated:</strong>{' '}
                {vendor?.updatedAt && vendor.updatedAt !== vendor.createdAt
                  ? format(new Date(vendor.updatedAt), 'PPpp')
                  : 'Never'}
              </p>
            </div>
          </Stack>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            id="vendor-history-tabs"
            className="mb-3"
          >
            <Tab eventKey="payments" title="Checks Sent">
              <VendorPaymentsTable vendorId={id} />
            </Tab>
            <Tab eventKey="charges" title="Booth Charges">
              <VendorBoothChargesTable vendorId={id} />
            </Tab>
            <Tab eventKey="balance-payments" title="Payments">
              <VendorBalancePaymentsTable vendorId={id} />
            </Tab>
          </Tabs>
        </Col>
      </Row>


      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter check number or payment description"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => {
                setShowPaymentModal(false);
                setPaymentDescription('');
                setPaymentMethod('Check');
              }}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Process Payment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddVendorForm vendor={vendor} />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
