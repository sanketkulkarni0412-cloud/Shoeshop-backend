const { db } = require('./firebaseAdmin');

const offers = [
    {
        title: "Free Shipping",
        description: "On all orders above ₹2000",
        type: "top-marquee",
        code: "FREESHIP",
        status: "active",
        priority: 100,
        createdAt: new Date().toISOString()
    },
    {
        title: "Flat 20% Off",
        description: "Use code FL20 on checkout",
        type: "top-marquee",
        code: "FL20",
        status: "active",
        priority: 90,
        createdAt: new Date().toISOString()
    },
    {
        title: "Easy Returns",
        description: "7 Days unconditional returns",
        type: "top-marquee",
        code: "",
        status: "active",
        priority: 80,
        createdAt: new Date().toISOString()
    },
    {
        title: "2 Year Warranty",
        description: "On all premium sneakers",
        type: "top-marquee",
        code: "WARRANTY20",
        status: "active",
        priority: 70,
        createdAt: new Date().toISOString()
    }
];

async function seedOffers() {
    console.log('Seeding Offers...');
    const adsCollection = db.collection('ads');

    for (const offer of offers) {
        // Check if exists to avoid dupes
        const snapshot = await adsCollection.where('title', '==', offer.title).get();
        if (snapshot.empty) {
            await adsCollection.add(offer);
            console.log(`Added offer: ${offer.title}`);
        } else {
            console.log(`Offer exists: ${offer.title}`);
        }
    }
    console.log('Seeding Complete!');
    process.exit();
}

seedOffers();
