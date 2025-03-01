import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const ConsentPopup = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('demo-consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('demo-consent', 'true');
        setShow(false);
    };

    return (
        <Modal show={show} centered>
            <Modal.Header>
                <Modal.Title>Demo Site Notice</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>This website is for demonstration purposes only. Please do not enter any sensitive or personal information.</p>
                <p>We use cookies to enhance your browsing experience, remember your preferences, and analyze our website traffic.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleAccept}>
                    Accept & Continue
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConsentPopup;
