import { VendorPayment, Vendor } from '../models/index.js';
import { sequelize } from '../config/db.js';

export const createPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const payment = await VendorPayment.create(req.body, { transaction: t });

        // Update vendor balance
        const vendor = await Vendor.findByPk(payment.vendorId, { transaction: t });
        if (!vendor) {
            await t.rollback();
            return res.status(404).json({ message: 'Vendor not found' });
        }

        await vendor.update({
            balance: vendor.balance - payment.amount
        }, { transaction: t });

        await t.commit();
        res.status(201).json(payment);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await VendorPayment.findAll({
            include: ['vendor']
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendorPayments = async (req, res) => {
    try {
        const payments = await VendorPayment.findAll({
            where: { vendorId: req.params.vendorId },
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await VendorPayment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const payment = await VendorPayment.findByPk(req.params.id, { transaction: t });
        if (!payment) {
            await t.rollback();
            return res.status(404).json({ message: 'Payment not found' });
        }

        const vendor = await Vendor.findByPk(payment.vendorId, { transaction: t });
        const oldAmount = payment.amount;
        const newAmount = req.body.amount;

        // Adjust vendor balance based on payment change
        await vendor.update({
            balance: vendor.balance + oldAmount - newAmount
        }, { transaction: t });

        await payment.update(req.body, { transaction: t });

        await t.commit();
        res.json(payment);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const deletePayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const payment = await VendorPayment.findByPk(req.params.id, { transaction: t });
        if (!payment) {
            await t.rollback();
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Restore vendor balance
        const vendor = await Vendor.findByPk(payment.vendorId, { transaction: t });
        await vendor.update({
            balance: vendor.balance + payment.amount
        }, { transaction: t });

        await payment.destroy({ transaction: t });

        await t.commit();
        res.status(204).send();
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
