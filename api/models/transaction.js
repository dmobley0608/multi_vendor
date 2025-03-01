import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { timeStampConfig } from '../utils/timeZone.js';

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

                // Calculate subtotal from items with explicit rounding
                const subTotal = items.reduce((sum, item) => {
                    return sum + Math.round(item.price * item.quantity);
                }, 0);

                transaction.subTotal = Math.round(subTotal);
                transaction.total = Math.round(transaction.subTotal + transaction.salesTax);
            }
            // Ensure final total is properly rounded
            transaction.total = Math.round(transaction.subTotal + transaction.salesTax);
        }
    }
});

// Instance method to recalculate totals
Transaction.prototype.recalculateTotals = async function () {
    const items = await this.getItems();
    this.subTotal = Math.round(items.reduce((sum, item) =>
        sum + Math.round(item.price * item.quantity), 0)
    );
    this.total = Math.round(this.subTotal + this.salesTax);
    await this.save();
};

export default Transaction;
