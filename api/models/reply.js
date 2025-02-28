import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Reply = sequelize.define('Reply', {
   body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    messageId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dateSent: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    read:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default Reply;
