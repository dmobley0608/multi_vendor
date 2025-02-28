import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './userModel.js';
import { timeStampConfig } from '../utils/timeZone.js';

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    ...timeStampConfig
});

export default Session;
