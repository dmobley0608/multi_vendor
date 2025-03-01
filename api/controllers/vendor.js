import { Vendor, User, TransactionItem, Transaction, Settings, VendorPayment, BoothRentalCharge, BalancePayment, Session } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs'
// Get all vendors (staff only)
export const getAllVendors = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const vendors = await Vendor.findAll({
            include: [{
                model: User,
                as: 'user',  // Changed from 'user' to 'vendorUser'
                attributes: ['username', 'email']
            },
            {
                model: VendorPayment,
                as: 'payments',
            },
            {
                model: BoothRentalCharge,
                as: 'boothRentalCharges',

            }
            ]
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get vendor by ID (staff or owner)
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'user',  // Changed from 'user' to 'vendorUser'
                attributes: ['username', 'email']
            },
            {
                model: VendorPayment,
                as: 'payments',
            },
            {
                model: BoothRentalCharge,
                as: 'boothRentalCharges',

            },
            {
                model: BalancePayment,
                as: 'balancePayments',
            }
            ]
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const user = await User.findByPk(req.userId);
        if (!user.isStaff && vendor.userId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create vendor (staff only)
export const createVendor = async (req, res) => {
    const { user, ...vendorData } = req.body;
    const { email } = user;
    const { firstName, lastName, phoneNumber } = vendorData;
    let vendor = {}
    try {
        const username = (firstName.charAt(0) + lastName).toLowerCase();
        const formattedPassword = username + '123!';
        const password = await bcrypt.hash(formattedPassword, 10);
        const newUser = await User.findOne({ where: { username } });
        if (newUser) {
            vendor = await Vendor.create({ ...vendorData, userId: newUser.id });
        } else {
            const newUser = await User.create({ username, email, password });
            vendor = await Vendor.create({ ...vendorData, userId: newUser.id })
        }

        res.status(201).json(vendor);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
};

// Update vendor (staff or owner)
export const updateVendor = async (req, res) => {
    try {
        const { user, password, ...vendorData } = req.body;
        const { username, email } = user;
        const vendor = await Vendor.findByPk(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const loggedInUser = await User.findByPk(req.userId);
        if (!loggedInUser.isStaff && vendor.userId !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.update({ password: hashedPassword }, { where: { id: vendor.userId } });
        }


        await User.update({ username, email: email ?? null }, { where: { id: vendor.userId } });
        vendor.changed('updatedAt', true);
        const updatedVendor = await vendor.update({ ...vendorData, updatedAt: new Date() });

        res.json(updatedVendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateVendorBalance = async (req, res) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const loggedInUser = await User.findByPk(req.userId);
        if (!loggedInUser.isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { amount } = req.body;

        await vendor.update({ balance: amount });
        res.json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Delete vendor (staff only)
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        await vendor.destroy();
        const vendors = await Vendor.findAll({ where: { userId: vendor.userId } })
        if (vendors.length == 0) {
            await Session.destroy({ where: { userId: vendor.userId } });
            await User.destroy({ where: { id: vendor.userId } });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendorMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.params;

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // Get store commission rate
        const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
        const commission = parseInt(commissionRate.value);

        const vendors = await Vendor.findAll({
            include: [
                {
                    model: TransactionItem,
                    as: 'transactionItems',
                    required: false,
                    include: [{
                        model: Transaction,
                        as: 'transaction',
                        attributes: ['paymentMethod']
                    }]
                },
                {
                    model: VendorPayment,
                    as: 'payments',
                    required: false
                },
                {
                    model: BoothRentalCharge,
                    as: 'boothRentalCharges',
                    attributes: ['id', 'amount', 'year', 'month', 'createdAt'],
                    required: false
                },
                {
                    model: BalancePayment,
                    as: 'balancePayments',
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email']
                }
            ]
        });

        const vendorReports = await Promise.all(vendors.map(async vendor => {
            // Calculate all-time totals excluding current month
            const allItems = vendor.transactionItems || [];

            // Filter out current month from historical calculations
            const historicalItems = allItems.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate < monthStart;
            });

            const allTimeSales = historicalItems.reduce((sum, item) => sum + item.total, 0);
            const allTimeCommission = Math.round((allTimeSales * commission) / 100);

            // Filter booth rentals excluding current month
            const historicalBoothRental = vendor.boothRentalCharges
                ?.filter(charge => (charge.year < parseInt(year)) ||
                    (charge.year === parseInt(year) && charge.month < parseInt(month)))
                ?.reduce((sum, charge) => sum + charge.amount, 0) || 0;

            // Filter payments excluding current month
            const historicalPayments = vendor.payments
                ?.filter(payment => (payment.year < parseInt(year)) ||
                    (payment.year === parseInt(year) && payment.month < parseInt(month)))
                ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

            // Filter balance payments excluding current month
            const historicalBalancePayments = vendor.balancePayments
                ?.filter(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    return paymentDate < monthStart;
                })
                ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

            // Calculate previous balance including balance payments
            const previousBalance = allTimeSales - (historicalBoothRental + allTimeCommission) - historicalPayments - historicalBalancePayments;

            // Current month calculations
            const currentMonthItems = allItems.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate >= monthStart && itemDate < monthEnd;
            });

            const totalItems = currentMonthItems.reduce((sum, item) => sum + item.quantity, 0);
            const cashSales = currentMonthItems
                .filter(item => item.transaction.paymentMethod === 'CASH')
                .reduce((sum, item) => sum + item.total, 0);
            const cardSales = currentMonthItems
                .filter(item => item.transaction.paymentMethod === 'CARD')
                .reduce((sum, item) => sum + item.total, 0);
            const totalSales = cashSales + cardSales;
            const storeCommission = Math.round((totalSales * commission) / 100);

            const boothRental = vendor.boothRentalCharges.filter(c => c.year === parseInt(year) && c.month === parseInt(month))?.reduce((sum, charge) => sum + charge.amount, 0) || 0;
            const payments = vendor.payments.filter(p => p.month === parseInt(month) && p.year === parseInt(year)) || [];
            const totalPayments = payments.filter(p => p.amount > 0)?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
            const monthlyEarnings = totalSales - boothRental - storeCommission;

            // Get current month balance payments
            const currentMonthBalancePayments = vendor.balancePayments
                ?.filter(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    return paymentDate >= monthStart && paymentDate < monthEnd;
                }) || [];

            const totalBalancePayments = currentMonthBalancePayments.reduce((sum, payment) => sum + payment.amount, 0) || 0;

            // Update monthlyBalance calculation
            const monthlyBalance = (monthlyEarnings) + previousBalance - totalPayments + totalBalancePayments;
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // Add 1 because months are 0-indexed
            const currentYear = currentDate.getFullYear();

            // Update vendor's balance if we're generating report for current month/year
            if (parseInt(month) === currentMonth && parseInt(year) === currentYear) {
                console.log("updating balance")
                await vendor.update({ balance: monthlyBalance });
            }

            return {
                id: vendor.id,
                firstName: vendor.firstName,
                lastName: vendor.lastName,
                currentBalance: vendor.balance,
                totalItems,
                cashSales,
                cardSales,
                totalSales,
                storeCommission,
                boothRentalCharges: vendor.boothRentalCharges.filter(c => c.month === parseInt(month) && c.year === parseInt(year)).map(c => ({
                    id: c.id,
                    amount: c.amount,
                    year: c.year,
                    month: c.month,
                    createdAt: c.createdAt
                })),
                payments: payments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    createdAt: p.createdAt,
                    year: p.year,
                    month: p.month
                })),
                totalPayments,
                balancePayments: currentMonthBalancePayments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    paymentDate: p.paymentDate,
                    paymentMethod: p.paymentMethod,
                    description: p.description
                })),
                totalBalancePayments,
                monthlyEarnings,
                monthlyBalance,
                previousBalance
            };
        }));

        res.json({
            month: parseInt(month),
            year: parseInt(year),
            vendors: vendorReports
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetVendorPassword = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id)
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const password = user.username + '123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while resetting password', error: error.message });
    }
}

const calculateSalesMetrics = (items, commission) => {
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const storeCommission = Math.round((totalAmount * commission) / 100);
    return {
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            createdAt: item.createdAt,
            paymentMethod: item.transaction.paymentMethod
        })),
        totalAmount,
        totalProfit: totalAmount - storeCommission
    };
};

export const getVendorByUser = async (req, res) => {
    try {
        const settings = await Settings.findOne({ where: { key: 'Store_Commission' } });
        const commission = parseInt(settings.value);

        const vendors = await Vendor.findAll({
            where: { userId: req.userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email']
                },
                {
                    model: VendorPayment,
                    as: 'payments',
                },
                {
                    model: BoothRentalCharge,
                    as: 'boothRentalCharges',
                },
                {
                    model: BalancePayment,
                    as: 'balancePayments',
                },
                {
                    model: TransactionItem,
                    as: 'transactionItems',
                    include: [{
                        model: Transaction,
                        as: 'transaction',
                        attributes: ['paymentMethod']
                    }]
                }
            ]
        });

        if (!vendors.length) {
            return res.status(404).json({ message: 'No vendors found for this user' });
        }

        const now = new Date();
        const startOfDay = new Date(now).setHours(0, 0, 0, 0);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
        const startOfYear = new Date(now.getFullYear(), 0, 1).setHours(0, 0, 0, 0);

        const vendorsWithSales = vendors.map(vendor => {
            const allItems = vendor.transactionItems || [];

            const salesCategories = {
                daily: calculateSalesMetrics(
                    allItems.filter(item => new Date(item.createdAt) >= startOfDay),
                    commission
                ),
                weekly: calculateSalesMetrics(
                    allItems.filter(item => new Date(item.createdAt) >= startOfWeek),
                    commission
                ),
                monthly: calculateSalesMetrics(
                    allItems.filter(item => new Date(item.createdAt) >= startOfMonth),
                    commission
                ),
                yearly: calculateSalesMetrics(
                    allItems.filter(item => new Date(item.createdAt) >= startOfYear),
                    commission
                ),
                allTime: calculateSalesMetrics(allItems, commission)
            };

            const vendorData = vendor.toJSON();
            delete vendorData.transactionItems;

            return {
                ...vendorData,
                sales: salesCategories
            };
        });

        res.json(vendorsWithSales);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

