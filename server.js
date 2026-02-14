const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
// const trackingRoutes = require('./routes/tracking');
const walletRoutes = require('./routes/wallet');
const adsRoutes = require('./routes/ads'); // Keep adsRoutes as it's used later

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ads', adsRoutes); // Corrected from adRoutes
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
// app.use('/api/tracking', trackingRoutes);
app.use('/api/wallet', walletRoutes);

// Admin Routes
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/users', userRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Shoe Shop API is running');
});

// Categories
const { categories } = require('./data');
app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// Admin Login (Mock)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'mock-admin-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    const { db } = require('./firebaseAdmin');
    if (!db) {
        return res.json({
            totalSales: 0,
            totalOrders: 0,
            totalUsers: 0,
            totalProducts: 0
        });
    }

    const pSnapshot = await db.collection('products').get();
    const oSnapshot = await db.collection('orders').get();
    const uSnapshot = await db.collection('users').get();

    let totalSales = 0;
    oSnapshot.forEach(doc => totalSales += (doc.data().total || 0));

    res.json({
        totalSales,
        totalOrders: oSnapshot.size,
        totalUsers: uSnapshot.size,
        totalProducts: pSnapshot.size,
        chartData: [
            { name: 'Jan', total: totalSales * 0.1 },
            { name: 'Feb', total: totalSales * 0.15 },
            { name: 'Mar', total: totalSales * 0.12 },
            { name: 'Apr', total: totalSales * 0.18 },
            { name: 'May', total: totalSales * 0.25 },
            { name: 'Jun', total: totalSales * 0.2 }
        ].map(d => ({ ...d, total: Math.round(d.total) }))
    });
});

// Checkout + Email
app.post('/api/send-email', async (req, res) => {
    const { email, orderDetails, total } = req.body;
    const { db } = require('./firebaseAdmin');

    if (db) {
        await db.collection('orders').add({
            customerEmail: email,
            items: orderDetails,
            total,
            status: 'Pending',
            date: new Date().toISOString()
        });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Order Confirmation - Shoe Shop',
            text: `Order placed successfully. Total: ₹${total}`
        });

        res.json({ message: 'Order placed & email sent' });
    } catch (err) {
        res.json({ message: 'Order placed but email failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
