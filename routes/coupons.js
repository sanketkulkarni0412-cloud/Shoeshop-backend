const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

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
