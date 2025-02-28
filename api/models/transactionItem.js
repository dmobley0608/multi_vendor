import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Vendor from "./vendor.js";
import Transaction from "./transaction.js";
import { timeStampConfig } from '../utils/timeZone.js';

const TransactionItem = sequelize.define('TransactionItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Vendor,
            key: 'id'
        }
    },
    transactionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Transaction,
            key: 'id'
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
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
        beforeSave: async (transactionItem) => {
            transactionItem.total = transactionItem.price * transactionItem.quantity;
        }
    }
});

export default TransactionItem;
