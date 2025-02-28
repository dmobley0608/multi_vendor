import React, { useState } from 'react';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useUpdateSettingByKeyMutation } from '../../services/Api';
import Swal from 'sweetalert2';

const SettingItem = ({ setting }) => {
    const [value, setValue] = useState(setting.value);
    const [updateSetting] = useUpdateSettingByKeyMutation();
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = async () => {
        try {
            // Show loading state
            Swal.fire({
                title: 'Updating Setting...',
                text: 'Please wait',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Attempt to update
            const result = await updateSetting({
                key: setting.key,
                value: value
            }).unwrap();

            // Close loading alert explicitly
            Swal.close();

            if (result) {
                await Swal.fire({
                    title: 'Success',
                    text: 'Setting updated successfully',
                    icon: 'success'
                });
                setIsEditing(false);
            }
        } catch (error) {
            // Close loading alert explicitly
            Swal.close();

            await Swal.fire({
                title: 'Error',
                text: error.data?.message || 'Failed to update setting',
                icon: 'error'
            });
        }
    };

    return (
        <Row className='mb-2 border-bottom align-items-end'>
            <Col sm={6} className='text-start '>
                <p className="fw-bolder p-0 m-0">{setting.key.replace('_', ' ')}:</p>
            </Col>
            <Col className="d-flex align-content-start text-start">
                {isEditing ? (
                    <>
                        <Form.Control
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <Button
                            variant="success"
                            size="sm"
                            onClick={handleUpdate}
                            className='mx-3'
                        >
                            Save
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setValue(setting.value);
                                setIsEditing(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <span className="flex-grow-1">{value}</span>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    </>
                )}
            </Col>
        </Row>
    );
};

export default SettingItem;
