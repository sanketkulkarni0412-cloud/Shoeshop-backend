const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

const adsCollection = db.collection('ads');

// GET All Ads (Admin: All, Public: Active Only)
router.get('/', async (req, res) => {
    try {
        const { role } = req.query; // 'admin' or undefined
        let query = adsCollection;

        if (role !== 'admin') {
            query = query.where('status', '==', 'active');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }

        const snapshot = await query.get();
        const ads = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // simple check for start/end date for public
            if (role !== 'admin') {
                const now = new Date();
                if (data.startDate && new Date(data.startDate) > now) return;
                if (data.endDate && new Date(data.endDate) < now) return;
            }
            ads.push({ id: doc.id, ...data });
        });

        // If public and not admin, sort client side or basic sort here
        if (role !== 'admin') {
            // In-memory sort by priority or fallback to created desc
            ads.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }

        res.json(ads);
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ error: 'Failed to fetch ads' });
    }
});

// POST Create Ad (Admin)
router.post('/', async (req, res) => {
    try {
        const { title, image, code, type, startDate, endDate, description, animationType } = req.body;

        const newAd = {
            title,
            image: image || '',
            code: code || '',
            type: type || 'sidebar', // sidebar, top-marquee, popup
            animationType: animationType || 'slide',
            description: description || '',
            status: 'active',
            startDate: startDate || null,
            endDate: endDate || null,
            createdAt: new Date().toISOString(),
            priority: 0
        };

        const docRef = await adsCollection.add(newAd);
        res.status(201).json({ id: docRef.id, ...newAd });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ad' });
    }
});

// PUT Update Ad (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await adsCollection.doc(id).update(updates);
        res.json({ id, ...updates });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ad' });
    }
});

// DELETE Ad (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await adsCollection.doc(id).delete();
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ad' });
    }
});

module.exports = router;
