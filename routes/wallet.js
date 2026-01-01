const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin.js');

// GET Wallet Balance & History
router.get('/:userId', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const wallet = userData.wallet || { balance: 0, transactions: [] };

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Top-up Wallet
router.post('/topup', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const { userId, amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const userRef = db.collection('users').doc(userId);

        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error('User not found');

            const userData = doc.data();
            const wallet = userData.wallet || { balance: 0, transactions: [] };

            const newBalance = (wallet.balance || 0) + amount;
            const newTransaction = {
                id: `TXN-${Date.now()}`,
                type: 'credit',
                amount: amount,
                description: 'Wallet Top-up',
                date: new Date().toISOString()
            };

            const transactions = [newTransaction, ...(wallet.transactions || [])];

            t.update(userRef, { wallet: { balance: newBalance, transactions } });
        });

        res.json({ message: 'Top-up successful', amount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Pay with Wallet
router.post('/pay', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const { userId, amount, orderId } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const userRef = db.collection('users').doc(userId);

        await db.runTransaction(async (t) => {
            const doc = await t.get(userRef);
            if (!doc.exists) throw new Error('User not found');

            const userData = doc.data();
            const wallet = userData.wallet || { balance: 0, transactions: [] };

            if (wallet.balance < amount) {
                throw new Error('Insufficient balance');
            }

            const newBalance = wallet.balance - amount;
            const newTransaction = {
                id: `TXN-${Date.now()}`,
                type: 'debit',
                amount: amount,
                description: `Payment for Order #${orderId}`,
                date: new Date().toISOString()
            };

            const transactions = [newTransaction, ...(wallet.transactions || [])];

            t.update(userRef, { wallet: { balance: newBalance, transactions } });
        });

        res.json({ message: 'Payment successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
