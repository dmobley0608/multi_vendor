import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";


const BoothRentalCharge = sequelize.define('BoothRentalCharge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
   amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
   year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});

export default BoothRentalCharge;