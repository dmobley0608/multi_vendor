import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { sequelize } from './config/db.js';
import './models/index.js';  // Import to initialize models and associations
import AuthRouter from './routes/authRoutes.js';
import VendorRouter from './routes/vendorRoutes.js';
import TransactionRouter from './routes/transactionRoutes.js';
import SettingsRouter from './routes/settingsRoutes.js';
import VendorPaymentRouter from './routes/vendorPaymentRoutes.js';
import BoothRentalRouter from './routes/boothRentalRoutes.js';
import BalancePaymentRouter from './routes/balancePaymentRoutes.js';
import MessagesRouter from './routes/messagesRoutes.js';
import { createStaffAccount } from './controllers/auth.js';
import { seedDatabase, User } from './models/index.js';

import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// //seedTransactions;
// app.get('/seed', async (req, res) => {
//     try {
//         await seedDatabase();
//         res.status(200).send('Database seeded');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error seeding database');
//     }
// }
// );


//Handle Static
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/vendors', VendorRouter);
app.use('/api/transactions', TransactionRouter);
app.use('/api/settings', SettingsRouter);
app.use('/api/vendor-payments', VendorPaymentRouter);
app.use('/api/booth-charges', BoothRentalRouter);
app.use('/api/balance-payments', BalancePaymentRouter);
app.use('/api/messages', MessagesRouter);

// Serve the frontend for all other users
app.get(/^\/(?!api).*/, (req, res) => {
    console.log(req.method + ' Request Path:', req.path);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Start server
const initializeServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        await sequelize.sync({ logging: false });
        console.log('Database synchronized...');

        const adminUser = await User.findOne({ where: { username: 'mdobbs' } });
        if (!adminUser) {
            await createStaffAccount();
        }
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

initializeServer();