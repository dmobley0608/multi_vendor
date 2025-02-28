import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Message = sequelize.define('Message', {
    body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receipientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    dateSent: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    senderDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    receipentDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

export default Message;