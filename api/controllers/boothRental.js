import { BoothRentalCharge, Vendor } from '../models/index.js';
import { sequelize } from '../config/db.js';

export const createCharge = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const charge = await BoothRentalCharge.create(req.body, { transaction: t });

        // Update vendor balance
        const vendor = await Vendor.findByPk(charge.vendorId, { transaction: t });
        if (!vendor) {
            await t.rollback();
            return res.status(404).json({ message: 'Vendor not found' });
        }

        await vendor.update({
            balance: vendor.balance - charge.amount
        }, { transaction: t });

        await t.commit();
        res.status(201).json(charge);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const getAllCharges = async (req, res) => {
    try {
        const charges = await BoothRentalCharge.findAll({
            include: ['vendor']
        });
        res.json(charges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendorCharges = async (req, res) => {
    try {
        const charges = await BoothRentalCharge.findAll({
            where: { vendorId: req.params.vendorId },
            order: [['createdAt', 'DESC']]
        });
        res.json(charges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChargeById = async (req, res) => {
    try {
        const charge = await BoothRentalCharge.findByPk(req.params.id);
        if (!charge) {
            return res.status(404).json({ message: 'Charge not found' });
        }
        res.json(charge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCharge = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const charge = await BoothRentalCharge.findByPk(req.params.id, { transaction: t });
        if (!charge) {
            await t.rollback();
            return res.status(404).json({ message: 'Charge not found' });
        }

        const vendor = await Vendor.findByPk(charge.vendorId, { transaction: t });
        const oldAmount = charge.amount;
        const newAmount = req.body.amount;

        // Adjust vendor balance based on charge change
        await vendor.update({
            balance: vendor.balance + oldAmount - newAmount
        }, { transaction: t });

        await charge.update(req.body, { transaction: t });

        await t.commit();
        res.json(charge);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const deleteCharge = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const charge = await BoothRentalCharge.findByPk(req.params.id, { transaction: t });
        if (!charge) {
            await t.rollback();
            return res.status(404).json({ message: 'Charge not found' });
        }

        // Update vendor balance
        const vendor = await Vendor.findByPk(charge.vendorId, { transaction: t });
        await vendor.update({
            balance: vendor.balance + charge.amount
        }, { transaction: t });

        await charge.destroy({ transaction: t });

        await t.commit();
        res.status(204).send();
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
