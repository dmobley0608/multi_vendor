import React, { useEffect, useState } from 'react'
import { Col, FloatingLabel, Form, Row, Button, Spinner } from 'react-bootstrap'
import { useAddVendorMutation, useUpdateVendorMutation } from '../../../services/Api'
import Swal from 'sweetalert2'
import { useLoading } from '../../../context/loadingContext';

export default function AddVendorForm({ vendor }) {
    const [data, setData] = useState({
        id: vendor?.id ?? '',
        firstName: vendor?.firstName ?? '',
        lastName: vendor?.lastName ?? '',
        phoneNumber: vendor?.phoneNumber ?? '',
        alternatePhoneNumber: vendor?.alternatePhoneNumber ?? '',
        streetAddress: vendor?.streetAddress ?? '',
        city: vendor?.city ?? '',
        state: vendor?.state ?? '',
        postalCode: vendor?.postalCode ?? '',
        user: {
            email: vendor?.user?.email ?? '',
            username: vendor?.user?.username ?? ''
        }
    });
    const [addVendor, { isLoading }] = useAddVendorMutation()

    const [updateVendor] = useUpdateVendorMutation()
    const {showLoading, hideLoading, withLoading} = useLoading();

    const onSubmit = async (e) => {
        e.preventDefault()
        let res = null
        try {
            showLoading(vendor ? 'Updating Vendor...' : 'Creating Vendor...')
            if (vendor) {
                // Convert empty strings to null for the update operation
                const cleanedData = Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [
                        key,
                        value === '' ? null :
                        (typeof value === 'object' && value !== null) ?
                            Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v === '' ? null : v])) :
                            value
                    ])
                );
                res = await updateVendor({
                    ...cleanedData,
                    id: vendor.id,
                })
            } else {
                res = await addVendor({
                    ...data,
                    user: {
                        ...data.user,
                        password: data.password
                    }
                })
            }

            if (res.error) {
                let message = '';
                if (res.error?.data.id) {
                    message += res.error?.data.id;
                }
                if (res.error?.data?.email) {
                    message += 'Email: ' + res.error?.data?.email;
                }

                await Swal.fire({
                    title: `${vendor ? 'Error Updating Vendor' : 'Error Creating Vendor'}`,
                    text: message.toUpperCase(),
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } else {
                await Swal.fire({
                    title: `${vendor ? 'Updated Successfully' : 'Created Successfully'}`,
                    text: `${vendor ? 'Vendor Updated Successfully' : "Vendor Created Successfully"}`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                const modal = document.getElementsByClassName('btn-close')[0];
                setData({
                    id: '',
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                    alternatePhoneNumber: '',
                    streetAddress: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    user: {
                        email: '',
                        username: ''
                    }
                })
                modal.click();
            }
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: 'An unexpected error occurred',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }finally{
            hideLoading();
        }

    }

    useEffect(() => {
        setData({
            id: vendor?.id ?? '',
            firstName: vendor?.firstName ?? '',
            lastName: vendor?.lastName ?? '',
            phoneNumber: vendor?.phoneNumber ?? '',
            alternatePhoneNumber: vendor?.alternatePhoneNumber ?? '',
            streetAddress: vendor?.streetAddress ?? '',
            city: vendor?.city ?? '',
            state: vendor?.state ?? '',
            postalCode: vendor?.postalCode ?? '',
            user: {
                email: vendor?.user?.email ?? '',
                username: vendor?.user?.username ?? ''
            }
        })

    }, [vendor])
    return (
        <>
            {data &&
                <Form onSubmit={onSubmit}>
                    {isLoading && (
                        <div className="text-center mb-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="text-muted mt-2">
                                {vendor ? 'Updating vendor...' : 'Creating vendor...'}
                            </p>
                        </div>
                    )}
                    <fieldset disabled={isLoading}>
                        <Row>
                            <Col sm={12} md={6}>
                                <FloatingLabel controlId="floatingInputId" label="Vendor ID" className="mb-3">
                                    <Form.Control
                                        type="number"
                                        placeholder="1234"
                                        value={data.id}
                                        onChange={({ target }) => setData({ ...data, id: target.value })}
                                        readOnly={vendor ? true : false}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} md={6}>
                                <FloatingLabel controlId="floatingInputFirstName" label="First Name" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="John"
                                        value={data.firstName}
                                        onChange={({ target }) => setData({ ...data, firstName: target.value })}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={12} md={6}>
                                <FloatingLabel controlId="floatingInputLastName" label="Last Name" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Doe"
                                        value={data.lastName}
                                        onChange={({ target }) => setData({ ...data, lastName: target.value })}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            {vendor && (
                                <Col sm={12} md={6}>
                                    <FloatingLabel controlId="floatingInputUsername" label="Username" className="mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="johndoe"
                                            value={data.user.username}
                                            onChange={({ target }) => setData({ ...data, user: { ...data.user, username: target.value } })}
                                            required
                                        />
                                    </FloatingLabel>
                                </Col>
                            )}
                            <Col sm={12} md={vendor ? 6 : 12}>
                                <FloatingLabel controlId='floatingInputEmail' label='Email' className='mb-3'>
                                    <Form.Control
                                        type='email'
                                        placeholder='jd@example.com'
                                        value={data.user.email}
                                        onChange={({ target }) => setData({ ...data, user: { ...data.user, email: target.value } })}

                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} md={6}>
                                <FloatingLabel controlId='floatingInputPhoneNumber' label='Primary Phone' className='mb-3'>
                                    <Form.Control type='text' placeholder='555 555 5555' value={data.phoneNumber}
                                        onChange={({ target }) => setData({ ...data, phoneNumber: target.value })} />
                                </FloatingLabel>
                            </Col>
                            <Col sm={12} md={6}>
                                <FloatingLabel controlId='floatingInputAltPhone' label='Alternate Phone' className='mb-3'>
                                    <Form.Control type='text' placeholder='555 555 5555' value={data.alternatePhoneNumber}
                                        onChange={({ target }) => setData({ ...data, alternatePhoneNumber: target.value })} />
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <FloatingLabel controlId="floatingInputStreetAddress" label="Street Address" className='mb-3'>
                            <Form.Control type="text" placeholder="123 Example Street" name='streetAddress' value={data.streetAddress}
                                onChange={({ target }) => setData({ ...data, streetAddress: target.value })} />
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
                                    <Form.Control type="text" placeholder="30543" name='postalCode' value={data.postalCode}
                                        onChange={({ target }) => setData({ ...data, postalCode: target.value })} />
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </fieldset>
                    <Row>
                        <Col sm={12} md={3}>
                            <Button
                                variant='success'
                                type='submit'
                                className='w-100'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        {vendor ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    vendor ? 'Update' : 'Create'
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            }
        </>
    )
}
