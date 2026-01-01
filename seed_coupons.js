const { db } = require('./firebaseAdmin');

async function seedCoupons() {
    if (!db) {
        console.error("Database connection failed.");
        process.exit(1);
    }

    const coupons = [
        {
            code: "SALE120",
            type: "percent",
            value: 30,
            isActive: true,
            description: "30% Off Storewide"
        }
    ];

    try {
        console.log("Seeding coupons...");
        const batch = db.batch();

        for (const coupon of coupons) {
            const docRef = db.collection('coupons').doc(coupon.code);
            batch.set(docRef, coupon);
        }

        await batch.commit();
        console.log("Coupons seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedCoupons();
