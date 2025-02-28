import User from './userModel.js';
import Session from './session.js';
import Vendor from './vendor.js';
import Transaction from './transaction.js';
import TransactionItem from './transactionItem.js';
import Settings from './settings.js';
import VendorPayment from './vendorPayment.js';
import BoothRentalCharge from './boothRental.js';
import BalancePayment from './balancePayment.js';
import Reply from './reply.js';
import Message from './message.js';
// Define associations
User.hasMany(Session);
Session.belongsTo(User);

// Update the Vendor-User association
User.hasOne(Vendor, {
    foreignKey: 'userId'
});
Vendor.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Transaction Associations
Transaction.hasMany(TransactionItem, {
    foreignKey: 'transactionId',
    as: 'items'
});
TransactionItem.belongsTo(Transaction, {
    foreignKey: 'transactionId',
    as: 'transaction'  // Add this alias
});

// Vendor Associations with TransactionItems
Vendor.hasMany(TransactionItem, {
    foreignKey: 'vendorId',
    as: 'transactionItems'
});
TransactionItem.belongsTo(Vendor, {
    foreignKey: 'vendorId',
    as: 'vendor'  // Add the alias here
});
Vendor.hasMany(VendorPayment, {
    foreignKey: 'vendorId',
    as: 'payments'
});
VendorPayment.belongsTo(Vendor, {
    foreignKey: 'vendorId'
});
Vendor.hasMany(BalancePayment, {
    foreignKey: 'vendorId',
    as: 'balancePayments'
});
BalancePayment.belongsTo(Vendor, {
    foreignKey: 'vendorId'
});
Vendor.hasMany(BoothRentalCharge, {
    foreignKey: 'vendorId',
    as: 'boothRentalCharges'
});
BoothRentalCharge.belongsTo(Vendor, {
    foreignKey: 'vendorId'
});

// Message-Reply associations
Message.hasMany(Reply, {
    foreignKey: 'messageId',
    as: 'replies'
});
Reply.belongsTo(Message, {
    foreignKey: 'messageId'
});

// Message Associations with User
User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'sentMessages'
});
User.hasMany(Message, {
    foreignKey: 'receipientId',
    as: 'receivedMessages'
});
Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender'
});
Message.belongsTo(User, {
    foreignKey: 'receipientId',
    as: 'recipient'
});


export const seedDatabase = async () => {
    const vendors = [5150, 100, 2806];
    const getRandomDate = () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
    };

    for (let i = 0; i < 50; i++) {
        const date = getRandomDate()
        const transaction = await Transaction.create({
            createdAt: date,
            paymentMethod: Math.random() > 0.5 ? 'CASH' : 'CARD',
            total: 0,
            salesTax: 0
        });

        const numItems = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numItems; j++) {
            const price = Math.floor(Math.random() * 1000) + 1;
            const quantity = 1;
            const vendorId = vendors[Math.floor(Math.random() * vendors.length)];

            let transactionItem = await TransactionItem.create({
                createdAt: date,
                transactionId: transaction.id,
                vendorId: vendorId,
                price: price,
                quantity: quantity,
                description: `Item ${j + 1}`
            });

            const vendor = await transactionItem.getVendor();
            const commissionRate = await Settings.findOne({ where: { key: 'Store_Commission' } });
            const commission = Math.round(((price * quantity) * (.13)));
            vendor.balance += Math.round(transactionItem.total - commission);
            await vendor.save();
        }

        // Get items and calculate totals
        const items = await TransactionItem.findAll({
            where: { transactionId: transaction.id }
        });

        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const salesTax = Math.round(subtotal * 0.07);
        const total = subtotal + salesTax;

        // Update transaction with calculated values
        await transaction.update({
            subtotal: subtotal,
            salesTax: salesTax,
            total: total
        });
    }
};

export {
    User,
    Session,
    Vendor,
    Transaction,
    TransactionItem,
    Settings,
    VendorPayment,
    BoothRentalCharge,
    BalancePayment,
    Message,
    Reply
};
