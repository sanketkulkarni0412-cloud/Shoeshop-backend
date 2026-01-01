const { db } = require('./firebaseAdmin');

const ads = [
    {
        title: "MIDNIGHT SALE",
        description: "50% Off Everything",
        code: "MIDNIGHT",
        type: "sidebar",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        title: "FREE SHIPPING",
        description: "On all orders > $100",
        type: "top-marquee",
        status: "active",
        createdAt: new Date().toISOString()
    },
    {
        title: "NEW DROPS",
        description: "Jordan 1 Retro High",
        code: "DROPS",
        type: "sidebar",
        status: "active",
        createdAt: new Date().toISOString()
    }
];

async function seedAds() {
    if (!db) {
        console.error("DB not connected");
        return;
    }
    const batch = db.batch();
    const collection = db.collection('ads');

    for (const ad of ads) {
        const ref = collection.doc();
        batch.set(ref, ad);
    }

    await batch.commit();
    console.log("Seeded Ads!");
}

seedAds().catch(console.error);
