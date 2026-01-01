const { auth, db } = require('./firebaseAdmin');
const readline = require('readline');

async function makeAdmin(email) {
    if (!auth || !db) {
        console.error("Firebase Admin not initialized. Check serviceAccountKey.json");
        process.exit(1);
    }

    try {
        // 1. Get user by email
        const user = await auth.getUserByEmail(email);
        console.log(`Found user: ${user.email} (${user.uid})`);

        // 2. Update Firestore document
        const userRef = db.collection('users').doc(user.uid);

        // Check if doc exists first
        const doc = await userRef.get();
        if (!doc.exists) {
            console.log("Creating new user document...");
            await userRef.set({
                email: user.email,
                role: 'admin',
                createdAt: new Date().toISOString()
            });
        } else {
            console.log("Updating existing user document...");
            await userRef.update({
                role: 'admin'
            });
        }

        console.log(`\nSUCCESS: ${email} is now an ADMIN.`);
        console.log("You can now log in at /admin/login");
        process.exit(0);

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.error(`\nERROR: No user found with email ${email}`);
            console.error("Please sign up in the app first!");
        } else {
            console.error("\nError:", error.message);
        }
        process.exit(1);
    }
}

// CLI Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the email address to make ADMIN: ', (email) => {
    makeAdmin(email.trim());
    rl.close();
});
