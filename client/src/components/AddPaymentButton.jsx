import React from 'react'
import { CiDollar } from 'react-icons/ci'

export default function AddPaymentButton({ onClick }) {
    return (
        <span className='btn' title='Add Payment' onClick={onClick} data-bs-toggle="modal" data-bs-target="#addVendorPaymentModal">
            <CiDollar  />
        </span>
    )
}
