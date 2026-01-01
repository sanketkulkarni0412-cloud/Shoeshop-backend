const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const { products } = require('../data'); // Fallback data

// GET all products
router.get('/', async (req, res) => {
    try {
        if (!db) return res.json(products); // Fallback to mock data if no DB

        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            console.log('Seeding products to Firestore...');
            const batch = db.batch();
            const createdItems = [];

            products.forEach(product => {
                // Use string ID for consistency
                const docId = String(product.id);
                const docRef = db.collection('products').doc(docId);
                // Remove id from data to avoid duplication inside doc
                const { id, ...productData } = product;
                batch.set(docRef, productData);
                createdItems.push({ id: docId, ...productData });
            });

            await batch.commit();
            console.log('Seeding complete.');
            return res.json(createdItems);
        }

        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });

        // Filter logic (Server side filtering)
        const { category, sale, search } = req.query;
        let filtered = items;

        if (category) {
            filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        if (sale === 'true') {
            filtered = filtered.filter(p => p.isSale);
        }

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
        }

        res.json(filtered);

    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET By ID
router.get('/:id', async (req, res) => {
    try {
        if (!db) {
            const product = products.find(p => p.id == req.params.id);
            return product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
        }

        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            // Check mock data fallback
            const product = products.find(p => p.id == req.params.id);
            return product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
        }
        res.json({ id: doc.id, ...doc.data() });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Add Product (Admin)
router.post('/', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const newProduct = req.body;
        // Logic to create a numeric ID or auto-ID? Firestore uses string IDs usually.
        // We can just use add() for auto ID.

        const docRef = await db.collection('products').add(newProduct);

        // Update the doc with its own ID if needed, or just return it
        const savedDoc = await docRef.get();
        res.status(201).json({ id: savedDoc.id, ...savedDoc.data() });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE Product
router.delete('/:id', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });
        await db.collection('products').doc(req.params.id).delete();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT Update Product (stock included)
router.put('/:id', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });

        const { id } = req.params;
        const updates = req.body;

        // Remove id if present in body
        delete updates.id;
        delete updates._id;

        const docRef = db.collection('products').doc(id);

        try {
            // Try updating first
            await docRef.update(updates);
        } catch (err) {
            // If update fails (likely doc doesn't exist), try to find it in mock data and restore it
            if (err.code === 5 || err.message.includes('NOT_FOUND')) {
                console.log(`Product ${id} not found in DB, attempting to restore from mock data...`);
                const mockProduct = products.find(p => String(p.id) === id);

                if (mockProduct) {
                    // Create full document with updates applied
                    const { id: mockId, ...productData } = mockProduct;
                    const mergedData = { ...productData, ...updates };
                    await docRef.set(mergedData);
                } else {
                    // Truly doesn't exist
                    throw err;
                }
            } else {
                throw err;
            }
        }

        // Fetch updated doc
        const updatedDoc = await docRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error) {
        console.error("Update failed:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
