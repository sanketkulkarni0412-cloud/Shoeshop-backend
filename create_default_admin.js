const { auth, db } = require('./firebaseAdmin');

async function createDefaultAdmin() {
    if (!auth || !db) {
        console.error("Firebase Admin not initialized.");
        process.exit(1);
    }

    const email = 'admin@shoeshop.com';
    const password = 'admin123';
    const name = 'System Admin';

    try {
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log("Admin user already exists.");
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.log("Creating new admin user...");
                user = await auth.createUser({
                    email,
                    password,
                    displayName: name,
                    emailVerified: true
                });
            } else {
                throw e;
            }
        }

        // Set Custom Claims (optional but good for Security Rules)
        // await auth.setCustomUserClaims(user.uid, { role: 'admin' });

        // Create/Update Firestore Document
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            uid: user.uid,
            email: user.email,
            name: user.displayName || name,
            role: 'admin',
            createdAt: new Date().toISOString(),
            image: "https://ui-avatars.com/api/?name=Admin&background=random"
        }, { merge: true });

        console.log("------------------------------------------------");
        console.log("ADMIN SETUP COMPLETE");
        console.log("------------------------------------------------");
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log("------------------------------------------------");
        process.exit(0);

    } catch (error) {
        console.error("Failed to create admin:", error);
        process.exit(1);
    }
}

createDefaultAdmin();
