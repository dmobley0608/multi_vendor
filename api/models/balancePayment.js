import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";


const BalancePayment = sequelize.define('BalancePayment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('Cash', 'Check', 'Card'),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});

export default BalancePayment;