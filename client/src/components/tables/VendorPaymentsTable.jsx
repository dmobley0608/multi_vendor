import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import { useState } from 'react';
import { BiDollarCircle, BiDownArrow, BiTrash, BiUpArrow } from 'react-icons/bi';
import { useDeleteVendorPaymentMutation } from '../../services/VendorApi';
import { Col, Modal, Row } from 'react-bootstrap';
import AddVendorPaymentForm from '../forms/vendor/AddVendorPaymentForm';

const VendorPaymentsTable = ({ payments, vendor }) => {
    const [deletePayment] = useDeleteVendorPaymentMutation()
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 5;

    const sortedPayments = [...payments].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = (id) => {
       deletePayment(id)
    };

    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = sortedPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <Row className='mb-3 align-items-center'>
                <Col>
                <h5>Payments</h5>
                </Col>
                <Col>
                <Button variant='' title='Add Payment' size='lg' data-bs-toggle="modal" data-bs-target="#addVendorPaymentModal"><BiDollarCircle/></Button>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th >
                            <div className='d-flex justify-content-center align-items-center'>
                                <div className='d-flex flex-column me-1 btn' onClick={() => handleSort('date')}>
                                <BiUpArrow/>
                                <BiDownArrow/>
                                </div>
                                <div>
                                Date
                                </div>
                            </div>

                        </th>
                        <th>
                        <div className='d-flex justify-content-center align-items-center'>
                                <div className='d-flex flex-column me-1 btn' onClick={() => handleSort('amount')}>
                                <BiUpArrow/>
                                <BiDownArrow/>
                                </div>
                                <div>
                                Amount
                                </div>
                            </div>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPayments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{payment.date}</td>
                            <td>${(payment.amount / 100).toFixed(2)}</td>
                            <td>
                                <Button size='sm' variant="danger" onClick={() => handleDelete(payment.id)}><BiTrash/></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {Array.from({ length: Math.ceil(payments.length / paymentsPerPage) }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
            <div id='addVendorPaymentModal' tabIndex={-1} aria-labelledby="addVendorPaymentModalLabel"
                className="modal modal-sm fade"      >
                <Modal.Dialog>
                    <Modal.Header id='addPaymentCloseBtn' closeButton data-bs-dismiss="modal" aria-label="Close">
                        <Modal.Title>New Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddVendorPaymentForm vendor={vendor} />
                    </Modal.Body>
                </Modal.Dialog>
            </div>
        </div>
    );
};

export default VendorPaymentsTable;