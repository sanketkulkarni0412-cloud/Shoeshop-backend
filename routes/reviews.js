const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const reviewsCollection = db.collection('reviews');

// GET reviews for a specific product (only approved ones)
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const snapshot = await reviewsCollection
            .where('productId', '==', productId)
            .where('status', '==', 'approved')
            .get();

        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        // Sort in memory to avoid Firestore Index requirement
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(reviews);
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// ADMIN: GET all reviews (pending, approved, rejected)
router.get('/admin/all', async (req, res) => {
    try {
        const snapshot = await reviewsCollection.orderBy('createdAt', 'desc').get();
        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error getting all reviews:', error);
        res.status(500).json({ error: 'Failed to fetch admin reviews' });
    }
});

// POST a new review
router.post('/', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        if (!productId || !userId || !rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newReview = {
            productId,
            userId,
            userName: userName || 'Anonymous',
            rating: Number(rating),
            comment: comment || '',
            status: 'approved', // Auto-approve for instant publishing
            createdAt: new Date().toISOString()
        };

        const docRef = await reviewsCollection.add(newReview);
        res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// ADMIN: PUT update review status (approve/reject)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await reviewsCollection.doc(id).update({ status });
        res.json({ message: `Review ${status} successfully` });
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ error: 'Failed to update review status' });
    }
});

// ADMIN: DELETE review
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await reviewsCollection.doc(id).delete();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
