import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";
import { timeStampConfig } from '../utils/timeZone.js';

const Vendor = sequelize.define('Vendor', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    alternateNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    streetAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    fullName: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${this.firstName} ${this.lastName}`;
        }
    }

}, {
    ...timeStampConfig
});

export default Vendor;