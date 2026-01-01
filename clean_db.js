const { db } = require('./firebaseAdmin');

async function cleanData() {
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

            // 1. Delete items with placeholder image
            if (data.image && data.image.includes('your-image-url-here')) {
                console.log(`Deleting product with invalid image: ${doc.id}`);
                batch.delete(doc.ref);
                deletedCount++;
            }

            // 2. Delete items with long auto-generated IDs if they duplicate numeric IDs?
            // For now, let's just rely on the route fix to handle uniqueness for display.
            // But we can clean up non-numeric IDs if we want close adherence to seed data.
            if (doc.id.length > 5) {
                // Assuming seed IDs are "1", "2", ... "30".
                // Be careful not to delete legitimate new products if user added them,
                // but user likely hasn't added distinct valid products yet given the errors.
                // Let's safe side: ONLY delete the image one.
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

cleanData();
