import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useCreateMessageMutation } from '../../../services/MessageApi';
import { useAuth } from '../../../context/authContext';
import Swal from 'sweetalert2';

export default function NewMessageForm({ vendors, onClose }) {
    const [createMessage] = useCreateMessageMutation();
    const { user } = useAuth();
    //Fetch vendors if the user is staff

    const [selectedVendors, setSelectedVendors] = useState([]);
    const [message, setMessage] = useState({
        recipients: [],
        subject: '',
        body: ''
    });

    // Add useEffect to log vendors for debugging
    React.useEffect(() => {
       
    }, [vendors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMessage(prev => ({ ...prev, [name]: value }));
    };

    const handleVendorSelect = (e) => {
        const selectedId = e.target.value;
        const selectedVendor = vendors?.find(vendor => vendor.id === parseInt(selectedId));

        if (selectedId && selectedVendor) {
            setSelectedVendors(prev => [...prev, selectedId]);
            setMessage(prev => ({
                ...prev,
                recipients: [...(prev.recipients || []), { id: selectedVendor.userId }]
            }));
        }
    };

    const handleRemoveVendor = (vendorId) => {
        setSelectedVendors(prev => prev.filter(id => id !== vendorId));
        setMessage(prev => ({
            ...prev,
            recipients: prev.recipients.filter(r => r.id !== parseInt(vendorId))
        }));
    };

    const handleSelectAll = () => {
        const allVendorIds = vendors?.map(vendor => vendor.userId.toString()) || [];
        const allRecipients = vendors?.map(vendor => ({ id: vendor.userId })) || [];
        setSelectedVendors(allVendorIds);
        setMessage(prev => ({ ...prev, recipients: allRecipients }));
    };

    const handleClearSelection = () => {
        setSelectedVendors([]);
        setMessage(prev => ({ ...prev, recipients: [] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const messagePayload = {
                ...message,
                recipients: user?.isStaff ? message.recipients : [{ id: 1 }]
            };

            await createMessage(messagePayload).unwrap();
            await Swal.fire('Success', 'Message sent successfully', 'success');
            onClose();
        } catch (error) {
            await Swal.fire('Error', error.data?.message || 'Failed to send message', 'error');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {user?.isStaff && (
                <Form.Group className="mb-3">
                    <Form.Label>Select Recipient</Form.Label>
                    {vendors?.length > 0 ? (
                        <>
                            <div className="d-flex gap-2 mb-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleClearSelection}
                                >
                                    Clear
                                </Button>
                            </div>
                            <Form.Select
                                name="recipient"
                                onChange={handleVendorSelect}
                                value=""
                            >
                                <option value="">Choose a vendor...</option>
                                {vendors.map(vendor => (
                                    <option
                                        key={vendor.id}
                                        value={vendor.id}
                                        disabled={selectedVendors.includes(vendor.id.toString())}
                                    >
                                        {vendor.firstName} {vendor.lastName}
                                    </option>
                                ))}
                            </Form.Select>

                            {/* Show selected vendors */}
                            {selectedVendors.length > 0 && (
                                <div className="mt-2">
                                    <p className="mb-1">Selected vendors:</p>
                                    {selectedVendors.map(id => {
                                        const vendor = vendors.find(v => v.id.toString() === id);
                                        return vendor ? (
                                            <span
                                                key={id}
                                                className="badge bg-primary me-1"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleRemoveVendor(id)}
                                            >
                                                {vendor.firstName} {vendor.lastName} ×
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-muted">Loading vendors...</p>
                    )}
                </Form.Group>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                    type="text"
                    name="subject"
                    value={message.subject}
                    onChange={handleInputChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="body"
                    value={message.body}
                    onChange={handleInputChange}
                    required
                />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={user?.isStaff && message.recipients.length === 0}
                >
                    Send
                </Button>
            </div>
        </Form>
    );
}
