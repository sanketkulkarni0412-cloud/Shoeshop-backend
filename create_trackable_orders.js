const { db } = require('./firebaseAdmin');

async function createTrackableOrders() {
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    const orders = [
        {
            status: 'Shipped',
            total: 5499,
            itemCount: 2,
            items: ['Nike Air Max', 'Puma Socks']
        },
        {
            status: 'Out for Delivery',
            total: 2100,
            itemCount: 1,
            items: ['Adidas Running Tee']
        },
        {
            status: 'Delivered',
            total: 8999,
            itemCount: 3,
            items: ['Jordan Retro', 'Shoe Cleaner', 'Laces']
        }
    ];

    console.log("Creating Test Orders...");
    console.log("------------------------------------------------");

    for (const order of orders) {
        const customId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

        // Mock timestamps based on status
        const now = Date.now();
        const date = new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(); // 5 days ago

        const orderData = {
            customId,
            date,
            status: order.status,
            total: order.total,
            paymentStatus: 'Paid',
            paymentMethod: 'Credit Card',
            customerEmail: 'test@demo.com',
            shippingAddress: {
                fullName: 'Test User',
                address: '123 Demo St',
                city: 'Tech City',
                postalCode: '100001'
            },
            orderDetails: order.items.map(name => ({ name, price: 1000, quantity: 1 })), // Mock details
            history: [
                {
                    newStatus: 'Processing',
                    timestamp: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
                    updatedBy: 'System'
                },
                ...(order.status !== 'Processing' ? [{
                    newStatus: 'Shipped',
                    timestamp: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
                    updatedBy: 'Admin'
                }] : []),
                ...(order.status === 'Out for Delivery' || order.status === 'Delivered' ? [{
                    newStatus: 'Out for Delivery',
                    timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
                    updatedBy: 'Carrier'
                }] : []),
                ...(order.status === 'Delivered' ? [{
                    newStatus: 'Delivered',
                    timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
                    updatedBy: 'Carrier'
                }] : [])
            ]
        };

        try {
            const res = await db.collection('orders').add(orderData);
            console.log(`[${order.status}] Order Created!`);
            console.log(`ID: ${res.id}`);
            console.log(`Order ID (for Tracking): ${customId}`);
            console.log("------------------------------------------------");
        } catch (error) {
            console.error("Error creating order:", error);
        }
    }
}

createTrackableOrders().then(() => {
    console.log("Done.");
    process.exit(0);
});
