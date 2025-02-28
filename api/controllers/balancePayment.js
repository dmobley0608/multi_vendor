import { BalancePayment, User, Vendor } from '../models/index.js';

// Get all balance payments (staff only)
export const getAllBalancePayments = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payments = await BalancePayment.findAll({
            include: [{
                model: Vendor,
                as: 'vendor',
                attributes: ['firstName', 'lastName']
            }]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get balance payment by ID (staff only)
export const getBalancePaymentById = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payment = await BalancePayment.findByPk(req.params.id, {
            include: [{
                model: Vendor,
                as: 'vendor',
                attributes: ['firstName', 'lastName']
            }]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create balance payment (staff only)
export const createBalancePayment = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payment = await BalancePayment.create(req.body);

        // Update vendor's balance
        const vendor = await Vendor.findByPk(payment.vendorId);
        if (vendor) {
            await vendor.update({
                balance: vendor.balance + payment.amount
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update balance payment (staff only)
export const updateBalancePayment = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payment = await BalancePayment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Revert previous balance change
        const vendor = await Vendor.findByPk(payment.vendorId);
        if (vendor) {
            await vendor.update({
                balance: vendor.balance + payment.amount - req.body.amount
            });
        }

        const updatedPayment = await payment.update(req.body);
        res.json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete balance payment (staff only)
export const deleteBalancePayment = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payment = await BalancePayment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Revert balance change
        const vendor = await Vendor.findByPk(payment.vendorId);
        if (vendor) {
            await vendor.update({
                balance: vendor.balance - payment.amount
            });
        }

        await payment.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get payments by vendor ID (staff only)
export const getPaymentsByVendorId = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payments = await BalancePayment.findAll({
            where: { vendorId: req.params.vendorId },
            include: [{
                model: Vendor,
                as: 'vendor',
                attributes: ['firstName', 'lastName']
            }]
        });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
