import React, { useEffect, useState } from 'react'
import { Button, Col, FloatingLabel, Form, Row } from 'react-bootstrap'
import { useAddVendorPaymentMutation } from '../../../services/Api'
import Swal from 'sweetalert2'

export default function AddVendorPaymentForm({ vendor }) {
    const [data, setData] = useState({amount:parseFloat(0.00).toFixed(2)})
    const [addPayment] = useAddVendorPaymentMutation()


    const onSubmit = async (e) => {
        e.preventDefault()
        let body = { vendor: vendor.id, amount: parseFloat(data.amount).toFixed(2) * 100 }
        const res = await addPayment(body)

        if (res?.data) {

            Swal.fire({
                title: `Payment Added Successfully`,
                icon: 'success',
                confirmButtonText: 'OK'
            })

            setData({ amount: 0.00.toFixed(2) })
            const modalCloseBtn = document.getElementById('addPaymentCloseBtn')
            modalCloseBtn?.click()
        }

        if (res?.error) {
            Swal.fire({
                title: 'Error Adding Payment',
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }

    useEffect(() => { }, [vendor, data])

    return (
        <Form onSubmit={onSubmit}>
            <h6>Add Payment to {vendor?.store_name ? vendor.store_name : vendor?.user?.name}</h6>
            <FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Amount" className="mb-3" >
                    <Form.Control type="number" step={.01} placeholder="0.00" name='amount' value={data.amount} onChange={({ target }) => setData({ ...data, amount: target.value })} required />
                </FloatingLabel>
            </FloatingLabel>
            <Row>
                <Col sm={12}>
                    <Button variant='success' type='submit' className='w-100'>Add Payment</Button>
                </Col>
            </Row>

        </Form>
    )
}
