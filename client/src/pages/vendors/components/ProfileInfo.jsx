import React from 'react';
import { Button } from 'react-bootstrap';
import { FaUserEdit } from 'react-icons/fa';
import { MdOutlineLockReset } from 'react-icons/md';

export default function ProfileInfo({ vendor, onEdit, onPasswordChange }) {
    return (
        <div className="border rounded p-3 text-start">
            <div className="d-flex justify-content-between mb-3 ">
                <h4>Profile Information</h4>
                <Button variant="outline-success" size="lg" onClick={onEdit}>
                    <FaUserEdit className="" />
                </Button>
            </div>
            <p><strong>Name:</strong> {vendor?.firstName} {vendor?.lastName}</p>
            <p><strong>Email:</strong> {vendor?.user?.email}</p>
            <p><strong>Phone:</strong> {vendor?.phoneNumber}</p>
            <p><strong>Alt. Phone:</strong> {vendor?.alternateNumber || 'N/A'}</p>
            <p><strong>Address:</strong> {vendor?.streetAddress}</p>
            <p>{vendor?.city}, {vendor?.state} {vendor?.postalCode}</p>

            <Button
                variant="outline-secondary"
                size="sm"
                onClick={onPasswordChange}
            >
                <MdOutlineLockReset className="me-2" />
                Change Password
            </Button>
        </div>
    );
}
