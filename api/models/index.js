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
User.hasMany(Vendor, {
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
