import { Settings, Transaction, TransactionItem, Vendor } from '../models/index.js';
import { Op } from 'sequelize';

export const createTransaction = async (req, res) => {
    let transaction;
    try {
        const { items, salesTax, paymentMethod } = req.body;

        transaction = await Transaction.create({
            salesTax,
            paymentMethod
        });

        // Create all transaction items
        for (let item of items) {
            const transactionItem = await TransactionItem.create({
                ...item,
                transactionId: transaction.id,
                total: item.price * item.quantity
            });
            const vendor = await transactionItem.getVendor();
            const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
            const commission = Math.round(transactionItem.total * (parseFloat(commissionRate.value) / 100));
            vendor.balance += Math.round(transactionItem.total - commission);
            await vendor.save();
        }

        // Recalculate totals after items are added
        await transaction.recalculateTotals();

        // Fetch complete transaction with items
        const completeTransaction = await Transaction.findByPk(transaction.id, {
            include: ['items']
        });

        res.status(201).json(completeTransaction);
    } catch (error) {
        await Transaction.destroy({ where: { id: transaction.id } });
        res.status(400).json({ message: error.message });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{
                model: TransactionItem,
                as: 'items',
                include: ['vendor']
            }]
        });
        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const salesTax = transactions.reduce((sum, transaction) => sum + transaction.salesTax, 0);
        const total = grandTotal - salesTax;
        const totalItems = transactions.reduce((sum, transaction) => {
            let count = 0;
            transaction.items.forEach(item => count += item.quantity);
            return sum + count;
        }, 0)

        res.json({
            transactions,
            count: transactions.length,
            totalItems,
            totalSalesTax: salesTax,
            totalAmount: total,
            grandTotal: grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: ['items']
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await transaction.update({ paymentMethod });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, { include: ['items'] });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        let vendor = null;
        if (transaction.items && transaction.items.length > 0) {
            transaction.items.forEach(async item => {
                vendor = await item.getVendor();
                const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
                const commission = Math.round(item.total * (parseFloat(commissionRate.value) / 100));
                const balance = vendor.balance -  Math.round(item.total - commission);
                await vendor.update({ balance });
                await item.destroy();
            }
            );

        }
        await transaction.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTransactionItem = async (req, res) => {
    try {
        const item = await TransactionItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Transaction item not found' });
        }
        //Get Current Commission Rate
        const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
        const totalCommission = item.total * (parseFloat(commissionRate.value) / 100);
        //Update Vendor Balance - remove previous profit
        let vendor = await item.getVendor();
        vendor.balance -= Math.round(item.total - totalCommission)
        await vendor.save();
        //Update Transaction Item
        await item.update(req.body);
        item.total = item.price * item.quantity;
        console.log("Item Total", item.total)
        vendor = await item.getVendor();
        await item.save()
        //Update Vendor Balance with new profit
        const commission = Math.round(item.total * (parseFloat(commissionRate.value) / 100))
        console.log(commission)
        vendor.balance += Math.round(item.total - commission)
        await vendor.save();
        //Recalculate Transaction Totals
        const transaction = await Transaction.findByPk(item.transactionId);
        await transaction.recalculateTotals()
        const salesTaxRate = await Settings.findOne({ where: { key: 'Sales_Tax' } });
        transaction.salesTax = Math.round(transaction.subTotal * (parseFloat(salesTaxRate.value) / 100));
        transaction.updatedAt = new Date()
        await transaction.save()
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteTransactionItem = async (req, res) => {
    try {
        const item = await TransactionItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Transaction item not found' });
        }
        const vendor = await item.getVendor();
        const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
        const commission = Math.round(item.total * (parseFloat(commissionRate.value) / 100));
        vendor.balance -= Math.round(item.total - commission);
        await vendor.save();
        await item.destroy();
        const transaction = await Transaction.findByPk(item.transactionId, {include: ['items']});
        if (transaction.items.length === 0) {
            await transaction.destroy();
        } else {
            await transaction.recalculateTotals()
            const salesTaxRate = await Settings.findOne({ where: { key: 'Sales_Tax' } });
            transaction.salesTax = Math.round(transaction.subTotal * (parseFloat(salesTaxRate.value) / 100));
            transaction.updatedAt = new Date()
            await transaction.save()
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTodaysTransactions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            include: ['items'],
            order: [['createdAt', 'DESC']]
        });

        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const salesTax = transactions.reduce((sum, transaction) => sum + transaction.salesTax, 0);
        const total = grandTotal - salesTax;
        const totalItems = transactions.reduce((sum, transaction) => {
            let count = 0;
            transaction.items.forEach(item => count += item.quantity);
            return sum + count;
        }, 0)

        res.json({
            transactions,
            count: transactions.length,
            totalItems,
            totalSalesTax: salesTax,
            totalAmount: total,
            grandTotal: grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWeeklyTransactions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start of week (Sunday)

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7); // End of week (next Sunday)

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: weekStart,
                    [Op.lt]: weekEnd
                }
            },
            include: ['items'],
            order: [['createdAt', 'DESC']]
        });

        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const salesTax = transactions.reduce((sum, transaction) => sum + transaction.salesTax, 0);
        const total = grandTotal - salesTax;
        const totalItems = transactions.reduce((sum, transaction) => {
            let count = 0;
            transaction.items.forEach(item => count += item.quantity);
            return sum + count;
        }, 0);

        res.json({
            transactions,
            count: transactions.length,
            totalItems,
            totalSalesTax: salesTax,
            totalAmount: total,
            grandTotal: grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMonthlyTransactions = async (req, res) => {
    try {
        const now = new Date();

        // Set to first day of current month at 00:00:00
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Set to first day of next month at 00:00:00
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: monthStart,
                    [Op.lt]: monthEnd
                }
            },
            include: ['items'],
            order: [['createdAt', 'DESC']]
        });

        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const salesTax = transactions.reduce((sum, transaction) => sum + transaction.salesTax, 0);
        const total = grandTotal - salesTax;
        const totalItems = transactions.reduce((sum, transaction) => {
            let count = 0;
            transaction.items.forEach(item => count += item.quantity);
            return sum + count;
        }, 0);
        res.json({
            transactions,
            count: transactions.length,
            totalItems,
            totalSalesTax: salesTax,
            totalAmount: total,
            grandTotal: grandTotal,
            periodStart: monthStart,
            periodEnd: monthEnd
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransactionsByMonthYear = async (req, res) => {
    try {
        const { month, year } = req.params;

        const monthStart = new Date(year, month - 1, 1); // month is 0-based in JS Date
        const monthEnd = new Date(year, month, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: monthStart,
                    [Op.lt]: monthEnd
                }
            },
            include: [{
                model: TransactionItem,
                as: 'items',
                include: [{
                    model: Vendor,
                    attributes: ['balance'],
                    include: ['payments', 'boothRentalCharges', 'items']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
        const salesTax = transactions.reduce((sum, transaction) => sum + transaction.salesTax, 0);
        const total = grandTotal - salesTax;
        const totalItems = transactions.reduce((sum, transaction) => {
            let count = 0;
            transaction.items.forEach(item => count += item.quantity);
            return sum + count;
        }, 0);

        res.json({
            transactions,
            count: transactions.length,
            totalItems,
            totalSalesTax: salesTax,
            totalAmount: total,
            grandTotal: grandTotal
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


