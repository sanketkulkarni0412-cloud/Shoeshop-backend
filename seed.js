const { db } = require('./firebaseAdmin');
const { products, categories } = require('./data');

async function seedDatabase() {
    if (!db) {
        console.error("Database connection failed. Check firebaseAdmin.js configuration.");
        process.exit(1);
    }

    try {
        console.log("Starting Seed...");

        const batch = db.batch();

        // Seed Products
        // We use product.id (number) as document ID string for easier reference/mock transition
        products.forEach(product => {
            const docRef = db.collection('products').doc(String(product.id));
            batch.set(docRef, product);
        });

        // We can also seed categories if we want them dynamic, but for now they are static arrays in code
        // Maybe create a config doc?
        // const catRef = db.collection('config').doc('categories');
        // batch.set(catRef, { list: categories });

        await batch.commit();
        console.log(`Successfully seeded ${products.length} products to Firestore.`);
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedDatabase();
