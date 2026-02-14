const { db } = require('./firebaseAdmin');

async function fixImage() {
    if (!db) {
        console.error("Database not connected.");
        return;
    }

    const productId = "11"; // ID for Oxford Cap Toe
    // A better image for a "Formal Oxford" shoe
    const newImage = "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600";

    const docRef = db.collection('products').doc(productId);

    try {
        const doc = await docRef.get();
        if (!doc.exists) {
            console.log(`Product ${productId} not found.`);
        } else {
            await docRef.update({ image: newImage });
            console.log(`Successfully updated image for Product ${productId} (Oxford Cap Toe).`);
        }
    } catch (error) {
        console.error("Error updating image:", error);
    }
}

fixImage().then(() => process.exit());
