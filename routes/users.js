const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// Upload Profile Picture
router.post('/:uid/profile-picture', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { uid } = req.params;
        const photoURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        if (db) {
            await db.collection('users').doc(uid).update({
                image: photoURL // Using 'image' to match existing frontend expectations from AuthContext
            });
            // Also try to update 'photoURL' for consistency if we want strictly standard firebase naming, 
            // but AuthContext uses `image: firebaseUser.photoURL || null` or locally stored `image`. 
            // Let's stick to update just the field we use or both if unsure. 
            // Looking at AuthContext: `image: firebaseUser.photoURL || null` but also `userData.image` isn't explicitly checked vs `userData` spreading.
            // Actually AuthContext line 58: `image: firebaseUser.photoURL || null` 
            // and line 47: `const userData = userDoc.exists() ? userDoc.data() : {};`
            // The spreading `...doc.data()` in users.js:14 implies fields are dynamic.
            // But AuthContext doesn't explicitly read `userData.image`. 
            // REQUIRED FIX: Update AuthContext to read `userData.image` as well if we are storing it in Firestore but not updating Firebase Auth (which requires Admin SDK `updateUser` or client SDK `updateProfile`).
            // Since we are using Firestore to extend user profile, we should update Firestore `image` field.
            await db.collection('users').doc(uid).set({ image: photoURL }, { merge: true });
        }

        res.json({ success: true, photoURL });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// GET All Users
router.get('/', async (req, res) => {
    try {
        if (!db) return res.json([
            { id: 'mock-1', name: 'Mock User', email: 'mock@test.com', joined: '2023-01-01' }
        ]);

        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
        res.json(users);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT Toggle User Status (Block/Unblock)
router.put('/:uid/status', async (req, res) => {
    try {
        const { uid } = req.params;
        const { status } = req.body; // 'active' or 'blocked'

        if (db) {
            await db.collection('users').doc(uid).update({ status });
        }
        res.json({ success: true, status });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
