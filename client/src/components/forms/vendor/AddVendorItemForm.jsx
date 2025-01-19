import React, { useEffect, useState } from 'react'
import { Button, Col, FloatingLabel, Form, Row, Spinner } from 'react-bootstrap'
import { useAddVendorItemMutation, useUpdateVendorItemMutation } from '../../../services/Api'
import Swal from 'sweetalert2'

export default function AddVendorItemForm({ vendor, vendorItem }) {
    const [data, setData] = useState({name:'', price:0})
    const [addItem, { isLoading }] = useAddVendorItemMutation()
    const [updateItem] = useUpdateVendorItemMutation()

    const onSubmit = async (e) => {
        e.preventDefault()
        let price = (data.price * 100).toFixed(0)
        let formData = { name:data.name, price: price, vendor: vendor.id }
        let res = null
        if (vendorItem) {
            formData = {...formData, itemId:vendorItem.id}
            console.log(formData)
            res = await updateItem({ ...formData })
        } else {
            res = await addItem({ ...formData })
        }
        if (res?.data) {
            Swal.fire({
                title: `${vendorItem ? 'Item updated' :'Item Added'}`,
                icon: 'success',
                confirmButtonText: 'OK'
            })
            const modal = document.getElementsByClassName('btn-close')[0]
            modal.click()
            setData(()=>({name:'', price:0}))
        }

        if (res?.error) {
            Swal.fire({
                title: 'Error Adding Item',
                text: `${vendorItem ?
                    'There was an error updating the item. Please try again or contact support' :
                    'There was an error adding the item. Please try again or contact support'}`,
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }

    useEffect(() => {
        if(vendorItem){
            setData(()=>({name:vendorItem.name, price:parseFloat(vendorItem.price)}))
        }
     }, [vendor,vendorItem])

    return (
        <Form onSubmit={onSubmit}>
            <FloatingLabel controlId="floatingInput" label="Name" className="mb-3" >
                <Form.Control type="text" placeholder="Item Name" name='name' defaultValue={vendorItem?.name ?? ''} onChange={({ target }) => setData({ ...data, name: target.value })} required />
            </FloatingLabel>
            <FloatingLabel controlId="floatingInput" label="Price" className="mb-3" >
                <Form.Control type="number" step={.01} placeholder="1.99" name='price' defaultValue={vendorItem ? vendorItem.price/100 : ''}
                 onChange={({ target }) => setData({ ...data, price: target.value })} required />
            </FloatingLabel>
            <Row>
                <Col sm={12} md={4}>
                    <Button className='w-100' variant='success' type='submit' disabled={isLoading}>
                        {vendorItem ?'Update':'Add'}
                        {isLoading && <span><Spinner size='sm' /></span>}
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}
