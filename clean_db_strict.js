const { db } = require('./firebaseAdmin');

async function cleanDataStrict() {
    if (!db) {
        console.error("Database not connected");
        process.exit(1);
    }

    try {
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();

        let deletedCount = 0;
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            let shouldDelete = false;

            // Check 1: Missing image field
            if (!data.image) shouldDelete = true;

            // Check 2: Invalid image URL format (basic check)
            else if (typeof data.image !== 'string' || !data.image.startsWith('http')) {
                console.log(`Invalid image URL for ${doc.id}: ${data.image}`);
                shouldDelete = true;
            }

            // Check 3: Placeholder text from earlier
            else if (data.image.includes('your-image-url-here')) shouldDelete = true;

            if (shouldDelete) {
                console.log(`Deleting product: ${doc.id} (${data.name})`);
                batch.delete(doc.ref);
                deletedCount++;
            }
        });

        if (deletedCount > 0) {
            await batch.commit();
            console.log(`Successfully deleted ${deletedCount} invalid products.`);
        } else {
            console.log("No invalid products found.");
        }

    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        process.exit(0);
    }
}

cleanDataStrict();
