import React, { useState } from 'react';
import { Container, Card, Spinner, Alert, Table, Form, Button } from 'react-bootstrap';
import { useGetSettingsQuery, useChangeMyPasswordMutation } from '../../services/Api';
import SettingItem from '../../components/settings/SettingItem';
import Swal from 'sweetalert2';

const Settings = () => {
    const { data: settings, isLoading, error } = useGetSettingsQuery();
    const [changePassword] = useChangeMyPasswordMutation();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            await Swal.fire('Error', 'New passwords do not match', 'error');
            return;
        }

        try {
            await changePassword({
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }).unwrap();

            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            await Swal.fire('Success', 'Password updated successfully', 'success');
        } catch (error) {
            await Swal.fire('Error', error.data?.message || 'Failed to update password', 'error');
        }
    };

    if (isLoading) {
        return <Spinner animation="border" className="d-flex mx-auto mt-5" />;
    }

    return (
        <Container className="">
            <Card className='mb-4 p-0 px-3' style={{maxWidth: '600px'}}>
                <Card.Body className="text-start p-0">
                    {settings?.map(setting => (
                        <div key={setting.id} className="">
                            <SettingItem setting={setting} />
                        </div>

                    ))}
                </Card.Body>
            </Card>




            {/* Password Change Column */}
            <Card className='mb-4 p-0 px-3' style={{maxWidth: '600px'}}>
                <Card.Header className="">
                    <h5 className="mb-0">Change Password</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handlePasswordChange}>
                        <div className="row">
                            <div className="col-md-8">
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords(prev => ({
                                            ...prev,
                                            currentPassword: e.target.value
                                        }))}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords(prev => ({
                                            ...prev,
                                            newPassword: e.target.value
                                        }))}
                                        required
                                        minLength={8}
                                    />
                                    <Form.Text className="text-muted">
                                        Minimum 8 characters
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords(prev => ({
                                            ...prev,
                                            confirmPassword: e.target.value
                                        }))}
                                        required
                                        minLength={8}
                                    />
                                </Form.Group>

                                <Button type="submit" variant="primary">
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>


        </Container>
    );
};

export default Settings;
