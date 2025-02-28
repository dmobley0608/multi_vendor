import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import {  timeStampConfig } from '../utils/timeZone.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    subTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    salesTax: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('CASH', 'CARD'),
        allowNull: false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    ...timeStampConfig,
    hooks: {
        beforeSave: async (transaction) => {
            if (transaction.changed('salesTax') || !transaction.subTotal) {
                const items = await transaction.getItems();

                // Calculate subtotal from items
                const subTotal = items.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                }, 0);
                
                transaction.subTotal = subTotal;
                transaction.total = subTotal + transaction.salesTax;
            }
            transaction.total = transaction.subTotal + transaction.salesTax;
        }
    }
});

// Instance method to recalculate totals
Transaction.prototype.recalculateTotals = async function () {
    const items = await this.getItems();
    this.subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subTotal + this.salesTax;
    await this.save();
};

export default Transaction;
