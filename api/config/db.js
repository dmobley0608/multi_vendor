import { Sequelize } from "sequelize";

// Create a new Sequelize instance
export const sequelize = new Sequelize(process.env.DATABASE_URL,{
    dialect:'postgres',
    protocol:'postgres',
    logging: false
})