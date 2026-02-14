const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// GET / - List all coupons
router.get('/', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB unavailable' });
        const snapshot = await db.collection('coupons').get();
        const coupons = [];
        snapshot.forEach(doc => coupons.push({ id: doc.id, ...doc.data() }));
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST / - Create a new coupon
router.post('/', async (req, res) => {
    try {
        const { code, type, value, expiryDate, usageLimit } = req.body;
        if (!code || !type || !value) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newCoupon = {
            code: code.toUpperCase(),
            type, // 'percent' or 'flat'
            value: Number(value),
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            usedCount: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('coupons').add(newCoupon);
        res.json({ id: docRef.id, ...newCoupon });

    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /:id - Delete a coupon
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('coupons').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /validate
router.post('/validate', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ valid: false, message: 'Coupon code is required' });
        }

        if (!db) {
            return res.status(503).json({ valid: false, message: 'Service unavailable' });
        }

        const couponRef = db.collection('coupons').where('code', '==', code).limit(1);
        const snapshot = await couponRef.get();

        if (snapshot.empty) {
            return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
        }

        const couponData = snapshot.docs[0].data();

        if (!couponData.isActive) {
            return res.status(400).json({ valid: false, message: 'This coupon has expired' });
        }

        let discountAmount = 0;
        if (couponData.type === 'percent') {
            discountAmount = (cartTotal * couponData.value) / 100;
        } else if (couponData.type === 'flat') {
            discountAmount = couponData.value;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        res.json({
            valid: true,
            code: couponData.code,
            discountType: couponData.type,
            discountValue: couponData.value,
            discountAmount: Math.ceil(discountAmount),
            message: 'Coupon applied successfully!'
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ valid: false, message: 'Internal server error' });
    }
});

module.exports = router;
