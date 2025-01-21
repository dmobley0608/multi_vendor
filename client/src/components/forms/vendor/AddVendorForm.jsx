import React, { useEffect, useState } from 'react'
import { Col, FloatingLabel, Form, Row, Button, Spinner } from 'react-bootstrap'
import { useAddVendorMutation, useUpdateVendorMutation } from '../../../services/Api'
import { useCreateUserMutation } from '../../../services/Api'
import Swal from 'sweetalert2'

export default function AddVendorForm({ vendor }) {

    const createPassword = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 10; i++) { result += characters.charAt(Math.floor(Math.random() * charactersLength)); }
        return result;
    }

    const [data, setData] = useState({
        email: vendor?.user?.email ?? '',
        phone_number: vendor?.user?.phone_number ?? '',
        name: vendor?.user?.name ?? '',
        id: vendor?.id ?? '',
        store_name: vendor?.store_name ?? '',
        street_address: vendor?.street_address ?? '',
        city: vendor?.city ?? '',
        state: vendor?.state ?? '',
        postal_code: vendor?.postal_code ?? '',
        password: createPassword(),
        balance: vendor?.balance ? parseFloat(vendor.balance / 100).toFixed(2) : 0.00
    })
    const [addVendor, { isLoading }] = useAddVendorMutation()
    const [addUser] = useCreateUserMutation()
    const [updateVendor] = useUpdateVendorMutation()



    const onSubmit = async (e) => {
        e.preventDefault()
        let res = null

        if (vendor) {
            let balance = parseFloat(data.balance).toFixed(2) * 100
            res = await updateVendor({
                ...data,
                id: vendor.id,
                balance: balance,
                user: { id: vendor.user.id, email: data.email, phone_number: data.phone_number, name: data.name },
                items: vendor.items,
                payments: vendor.payments
            })
        } else {
            res = await addVendor({
                ...data,
                user: { email: data.email, password: data.password, name: data.name, phone_number:data.phone_number },
                items: [],
                payments:[]
            })
        }


        if (res.error) {
            let message = ''
            if (res.error?.data.id) {
                message += res.error?.data.id
            }
            if (res.error?.data?.user?.email) {
                message += 'Email: ' + res.error?.data?.user?.email
            }
            Swal.fire({
                title: `${vendor ? 'Error Updating Vendor' : 'Error Creating Vendor'}`,
                text: message.toUpperCase(),
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
        if (res?.data) {
            Swal.fire({
                title: `${vendor ? 'Updated Successfully' : 'Created Successfully'}`,
                text: `${vendor ? 'Vendor Updated Successfully' : "Vendor Created Successfully"}`,
                icon: 'success',
                confirmButtonText: 'OK'
            })
            const modal = document.getElementsByClassName('btn-close')[0]
            modal.click()
        }
    }

    useEffect(() => {
        setData({
            email: vendor?.user?.email ?? '',
            phone_number: vendor?.user?.phone_number ?? '',
            name: vendor?.user?.name ?? '',
            id: vendor?.id ?? '',
            store_name: vendor?.store_name ?? '',
            street_address: vendor?.street_address ?? '',
            city: vendor?.city ?? '',
            state: vendor?.state ?? '',
            postal_code: vendor?.postal_code ?? '',
            password: createPassword(),
            balance: vendor?.balance ? parseFloat(vendor.balance / 100).toFixed(2) : '0.00'
        })

    }, [vendor])
    return (
        <>
            {data &&
                <Form onSubmit={onSubmit}>
                    <h6>User Info</h6>
                    <FloatingLabel controlId="floatingInputName" label="Name" className="mb-3" >
                        <Form.Control type="text" placeholder="John Doe" name='name' value={data.name}
                            onChange={({ target }) => setData({ ...data, name: target.value })} required />
                    </FloatingLabel>
                    <FloatingLabel controlId='floatingInputEmail' label='Email' className='mb-3'>
                        <Form.Control type='email' placeholder='jd@example.com' name='email' value={data.email}
                            onChange={({ target }) => setData({ ...data, email: target.value })} required />
                    </FloatingLabel>
                    <FloatingLabel controlId='floatingInputPhoneNumber' label='Phone Number (Optional)' className='mb-3'>
                        <Form.Control type='text' placeholder='555 555 5555' name='phone_number' value={data.phone_number}
                            onChange={({ target }) => setData({ ...data, phone_number: target.value })} />
                    </FloatingLabel>
                    <h6>Store Info</h6>
                    <Row>
                        <Col sm={12} md={6}>
                            <FloatingLabel controlId="floatingInputVendorId" label="Vendor Id" className='mb-3'>
                                <Form.Control type="number" placeholder="5175" name='id' value={data.id}
                                    onChange={({ target }) => setData({ ...data, id: target.value })} readOnly={vendor?.id ? true : false} />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <FloatingLabel controlId="floatingInputStoreName" label="Store Name" className='mb-3'>
                        <Form.Control type="text" placeholder="The Item Shop" name='store_name' value={data.store_name}
                            onChange={({ target }) => setData({ ...data, store_name: target.value })} />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInputStreetAddress" label="Street Address" className='mb-3'>
                        <Form.Control type="text" placeholder="123 Example Street" name='street_address' value={data.street_address}
                            onChange={({ target }) => setData({ ...data, street_address: target.value })} />
                    </FloatingLabel>
                    <Row>
                        <Col sm={12} md={5}>
                            <FloatingLabel controlId="floatingInputCity" label="City" className='mb-3'>
                                <Form.Control type="text" placeholder="Helen" name='city' value={data.city}
                                    onChange={({ target }) => setData({ ...data, city: target.value })} />
                            </FloatingLabel>
                        </Col>
                        <Col sm={12} md={2}>
                            <FloatingLabel controlId="floatingInputState" label="State" className='mb-3'>
                                <Form.Control type="text" placeholder="Ga" name='state' value={data.state}
                                    onChange={({ target }) => setData({ ...data, state: target.value })} />
                            </FloatingLabel>
                        </Col>
                        <Col sm={12} md={5}>
                            <FloatingLabel controlId="floatingInputPostalCode" label="Postal Code" className='mb-3'>
                                <Form.Control type="text" placeholder="30543" name='postal_code' value={data.postal_code}
                                    onChange={({ target }) => setData({ ...data, postal_code: target.value })} />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    {!vendor ?
                        <Row>
                            <Col sm={12}>
                                <small className='text-danger'>Please make a note of this to send to the vendor. They will change thier password once they login.</small>
                                <FloatingLabel controlId="floatingInputPassword" label="Password" className='mb-3'>
                                    <Form.Control type="text" placeholder="password" name='password' value={data.password} disabled />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        :
                        <FloatingLabel controlId="floatingInputBalance" label="Balance" className='mb-3'>
                            <Form.Control type="number" step={.01} placeholder="0.00" name='balance' value={data.balance}
                                onChange={({ target }) => setData({ ...data, balance: target.value })} />
                        </FloatingLabel>
                    }
                    <Row>
                        <Col sm={12} md={3}>
                            <Button variant='success' type='submit' className='w-100' disabled={isLoading}>
                                {vendor ? 'Update' : 'Create'}
                                {isLoading && <span><Spinner /></span>}
                            </Button>
                        </Col>
                    </Row>

                </Form>
            }
        </>
    )
}
