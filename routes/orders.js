const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// GET Orders (Admin)
router.get('/', async (req, res) => {
    try {
        if (!db) return res.json([]); // Fallback

        const snapshot = await db.collection('orders').orderBy('date', 'desc').get();
        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Single Order by ID
router.get('/:id', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const doc = await db.collection('orders').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Create Order (When user checkouts)
router.post('/', async (req, res) => {
    try {
        // Generate Human Readable ID: ORD- + 6 random alphanumeric chars
        const customId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

        const orderData = {
            ...req.body, // Should include paymentMethod, couponCode, discountAmount, originalTotal
            customId, // Save the readable ID
            date: new Date().toISOString(),
            status: 'Processing',
            paymentStatus: req.body.paymentMethod === 'Razorpay' || req.body.paymentMethod === 'Wallet' || req.body.paymentMethod.startsWith('Wallet +') ? 'Paid' : 'Pending',
        };

        // Handle Wallet Payment Deduction
        if ((req.body.paymentMethod === 'Wallet' || req.body.paymentMethod.startsWith('Wallet +')) && db) {
            const userId = req.body.userId; // Ensure frontend sends userId
            const walletDeduction = req.body.walletUsed || 0;

            if (userId && walletDeduction > 0) {
                await db.runTransaction(async (t) => {
                    const userRef = db.collection('users').doc(userId);
                    const userDoc = await t.get(userRef);

                    if (!userDoc.exists) {
                        throw new Error('User not found for wallet transaction');
                    }

                    const userData = userDoc.data();
                    const currentBalance = userData.wallet?.balance || 0;

                    if (currentBalance < walletDeduction) {
                        throw new Error('Insufficient wallet balance');
                    }

                    const newBalance = currentBalance - walletDeduction;
                    const newTransaction = {
                        id: `PAY-${customId}-${Date.now()}`,
                        type: 'debit',
                        amount: walletDeduction,
                        description: `Payment for Order #${customId}`,
                        date: new Date().toISOString()
                    };

                    t.update(userRef, {
                        wallet: {
                            balance: newBalance,
                            transactions: [newTransaction, ...(userData.wallet?.transactions || [])]
                        }
                    });
                });
            }
        }

        let id = 'offline-id-' + Date.now();
        if (db) {
            const docRef = await db.collection('orders').add(orderData);
            id = docRef.id;
        }

        // Return ID so frontend can redirect
        res.status(201).json({ id, ...orderData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Track Order (Public/User)
router.post('/track', async (req, res) => {
    try {
        const { orderId, email } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        if (!db) return res.status(503).json({ error: 'Database not connected' });

        // Try to find by Document ID first
        let doc = await db.collection('orders').doc(orderId).get();
        let order = null;

        if (doc.exists) {
            order = doc.data();
            order.id = doc.id;
        } else {
            // If not found, try to find by Custom ID
            const snapshot = await db.collection('orders').where('customId', '==', orderId).limit(1).get();
            if (!snapshot.empty) {
                doc = snapshot.docs[0];
                order = doc.data();
                order.id = doc.id;
            }
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found. Please check your ID.' });
        }

        // Optional: Email verification if provided
        if (email && order.email && order.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(403).json({ error: 'Email does not match our records for this order.' });
        }

        // Return sanitized data (no full address/phone for privacy if not authenticated)
        // Unless we require login, but requirement said accessible from footer (public-ish)
        // Return sanitized data
        res.json({
            id: order.id,
            customId: order.customId, // Return the readable ID too
            status: order.status,
            date: order.date,
            total: order.total,
            itemCount: order.orderDetails ? order.orderDetails.length : 0,
            items: order.orderDetails ? order.orderDetails.map(i => i.name).slice(0, 3) : [], // Show first 3 names
            paymentMethod: order.paymentMethod
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT Update Status with History & Notifications
router.put('/:id', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const { status, delayNote, adminUser } = req.body;
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const currentOrder = doc.data();
        const previousStatus = currentOrder.status;

        // Create History Entry
        const newHistoryEntry = {
            previousStatus,
            newStatus: status,
            timestamp: new Date().toISOString(),
            updatedBy: adminUser || 'Admin', // Default to 'Admin' if not provided
            delayNote: delayNote || null
        };

        const updateData = {
            status,
            history: [...(currentOrder.history || []), newHistoryEntry]
        };

        if (delayNote) {
            updateData.delayNote = delayNote;
        }

        // Handle Refund if Cancelled or Returned
        let refundProcessed = false;
        if ((status === 'Cancelled' || status === 'Returned') && previousStatus !== 'Cancelled' && previousStatus !== 'Returned' && currentOrder.paymentStatus === 'Paid') {
            const refundAmount = currentOrder.total;
            const userId = currentOrder.userId;

            if (userId && db) { // Added db check for safety
                // Perform Wallet Transaction
                await db.runTransaction(async (t) => {
                    const userRef = db.collection('users').doc(userId);
                    const userDoc = await t.get(userRef);

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const wallet = userData.wallet || { balance: 0, transactions: [] };

                        const newBalance = (wallet.balance || 0) + refundAmount;
                        const newTransaction = {
                            id: `REF-${req.params.id}-${Date.now()}`,
                            type: 'credit',
                            amount: refundAmount,
                            description: `Refund for Order #${currentOrder.customId || req.params.id}`,
                            date: new Date().toISOString()
                        };

                        t.update(userRef, {
                            wallet: {
                                balance: newBalance,
                                transactions: [newTransaction, ...(wallet.transactions || [])]
                            }
                        });
                    }
                });

                updateData.refundStatus = 'Refunded';
                updateData.status = status; // Ensure status is set
                // Add refund event to history
                updateData.history.push({
                    previousStatus: status,
                    newStatus: 'Refunded',
                    timestamp: new Date().toISOString(),
                    updatedBy: 'System',
                    delayNote: 'Refund processed to wallet'
                });
                refundProcessed = true;
            }
        }

        // INVOICE VERSIONING LOGIC
        const currentVersions = currentOrder.invoiceVersions || [];
        const nextVersionNumber = currentVersions.length + 1;

        const newInvoiceVersion = {
            version: nextVersionNumber,
            timestamp: new Date().toISOString(),
            status: status,
            total: currentOrder.total, // Snapshot total at this version
            admin: adminUser || 'Admin',
            changes: delayNote ? `Status update to ${status} with note: ${delayNote}` : `Status update to ${status}`
        };

        updateData.invoiceVersions = [...currentVersions, newInvoiceVersion];

        await orderRef.update(updateData);

        // Mock Notification Logic
        console.log(`[MOCK NOTIFICATION] Email/SMS sent to ${currentOrder.customerEmail || 'User'}: Your order status is now ${status}. ${refundProcessed ? `Refund of ₹${currentOrder.total} initiated.` : ''} ${delayNote ? `Note: ${delayNote}` : ''}`);

        res.json({
            id: req.params.id,
            status,
            history: updateData.history,
            delayNote: updateData.delayNote,
            refundStatus: updateData.refundStatus,
            notificationSent: true
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
