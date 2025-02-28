import { Vendor, User, TransactionItem, Transaction, Settings, VendorPayment, BoothRentalCharge, BalancePayment } from '../models/index.js';
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
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

// Create vendor (staff only)
export const createVendor = async (req, res) => {
    const { user, ...vendorData } = req.body;
    let { email } = user;
    const { firstName, lastName, phoneNumber } = vendorData;
    try {
        const username = (firstName.charAt(0) + lastName).toLowerCase();
        const formattedPassword = username + '123!';
        const password = await bcrypt.hash(formattedPassword, 10);

        // Set email to null if it's empty or undefined
        const userEmail = (!email || email.trim() === '') ? null : email.trim();

        const [newUser, created] = await User.findOrCreate({
            where: { username },
            defaults: {
                email: userEmail,
                isStaff: false,
                password: password
            }
        });

        if (!created) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const vendor = await Vendor.create({
            ...vendorData,
            userId: newUser.id
        });

        res.status(201).json({
            ...vendor.toJSON(),
            user: {
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Vendor creation error:', error);
        // If user was created but vendor creation failed, clean up the user
        if (error.name === 'SequelizeValidationError') {
            try {
                await User.destroy({ where: { username: (firstName.charAt(0) + lastName).toLowerCase() } });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
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
        await User.destroy({ where: { id: vendor.userId } });
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
        const commission = parseFloat(commissionRate.value/ 100).toFixed(2); ;

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

        const vendorReports = vendors.map(vendor => {
            // Calculate all-time totals excluding current month
            const allItems = vendor.transactionItems || [];

            // Filter out current month from historical calculations
            const historicalItems = allItems.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate < monthStart;
            });

            const allTimeSales = historicalItems.reduce((sum, item) => sum + item.total, 0);
            const allTimeCommission = Math.round(allTimeSales * commission);

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
            const storeCommission = Math.round(totalSales * commission);

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
                previousBalance,
                items: currentMonthItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    description: item.description,
                    price: item.price,
                    total: item.total,
                    createdAt: item.createdAt,
                    paymentMethod: item.transaction.paymentMethod
                }))
            };
        });

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
    const storeCommission = totalAmount * commission;
    return {
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            description: item.description,
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
        const commission = parseFloat(settings.value) / 100;

        const vendor = await Vendor.findOne({
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

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const now = new Date();
        // Set to start of current day (midnight)
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Set to start of current week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Set to start of current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Set to start of current year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const allItems = vendor.transactionItems || [];

        const salesCategories = {
            daily: calculateSalesMetrics(
                allItems.filter(item => {
                    const itemDate = new Date(item.createdAt);
                    return itemDate >= startOfDay;
                }),
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

        const response = {
            ...vendor.toJSON(),
            transactionItems: undefined, // Remove the original transactionItems
            sales: salesCategories
        };

        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

