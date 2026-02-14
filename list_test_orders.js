const { db } = require('./firebaseAdmin');

async function listOrders() {
    const snapshot = await db.collection('orders').orderBy('date', 'desc').limit(3).get();
    console.log("\n--- TEST ORDERS ---");
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Status: ${data.status.padEnd(16)} | ID: ${data.customId}`);
    });
    console.log("-------------------\n");
    process.exit(0);
}

listOrders();
