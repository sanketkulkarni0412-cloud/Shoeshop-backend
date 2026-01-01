const categories = [
    "Sports",
    "Running",
    "Casual",
    "Formal",
    "Sneakers",
    "Boots",
    "Sandals",
    "Hiking",
    "Training"
];

// Verified Working Unsplash URLs
const IMAGES = {
    nike_red: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    nike_white: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=600",
    nike_air: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
    adidas_white: "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=600",
    adidas_yeezy: "https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&q=80&w=600",
    jordan: "https://images.unsplash.com/photo-1579338559194-a162d854dbcf?auto=format&fit=crop&q=80&w=600",
    jordan_low: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600",
    vans: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
    converse: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&q=80&w=600",
    timberland: "https://images.unsplash.com/photo-1511556820780-dba9af74f9d5?auto=format&fit=crop&q=80&w=600",
    dr_martens: "https://images.unsplash.com/photo-1638361661645-a4f661001bc5?auto=format&fit=crop&q=80&w=600",
    formal_oxford: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=600",
    formal_loafer: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
    running_asics: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600",
    running_blue: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=600",
    sandals: "https://images.unsplash.com/photo-1545620862-588358e6e587?auto=format&fit=crop&q=80&w=600",
    hiking: "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?auto=format&fit=crop&q=80&w=600",
    hiking_dark: "https://images.unsplash.com/photo-1621251336465-45453e020580?auto=format&fit=crop&q=80&w=600",
    reebok_nano: "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?auto=format&fit=crop&q=80&w=600",

    // High-reliability replacements
    air_jordan_legacy_fix: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&q=80&w=600",
    yeezy_fix: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?auto=format&fit=crop&q=80&w=600",

    // Final Fixes
    premium_6_inch_fix: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600", // New Timberland style
    chelsea_fix: "https://images.unsplash.com/photo-1534653299134-96a171b61581?auto=format&fit=crop&q=80&w=600",
    desert_boot_fix: "https://images.unsplash.com/photo-1542838686-37da5a5fd84f?auto=format&fit=crop&q=80&w=600", // Back to reliable suede boot
    arizona_fix: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600", // New Sandal Placeholder (Nike style but works)
    x_ultra_4_fix: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=600",
    green_shoe: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600", // Added Green
};

const STANDARD_COLORS = [
    { name: "Red", hex: "#EF4444", image: IMAGES.nike_red },
    { name: "Blue", hex: "#3B82F6", image: IMAGES.running_blue },
    { name: "Green", hex: "#10B981", image: IMAGES.green_shoe }, // Using new green image
    { name: "White", hex: "#FFFFFF", image: IMAGES.nike_white }
];

const products = [
    // Running
    {
        id: 1,
        name: "Velocity Runner X1",
        brand: "Nike",
        price: 10995,
        originalPrice: 12995,
        discount: 15,
        category: "Running",
        image: IMAGES.nike_red,
        colors: [
            { name: "Red", hex: "#EF4444", image: IMAGES.nike_red },
            { name: "Blue", hex: "#3B82F6", image: IMAGES.running_blue },
            { name: "White", hex: "#FFFFFF", image: IMAGES.nike_white }
        ],
        sizes: [7, 8, 9, 10, 11],
        description: "High-performance running shoe with adaptive cushioning for marathon distances.",
        isSale: true
    },
    {
        id: 2,
        name: "Speed Demon 2",
        brand: "Adidas",
        price: 7999,
        originalPrice: 7999,
        discount: 0,
        category: "Running",
        image: IMAGES.adidas_white,
        sizes: [6, 7, 8, 9, 10, 11],
        description: "Lightweight trainer built for speed and agility.",
        isSale: false
    },
    {
        id: 3,
        name: "Cloud Strider",
        brand: "Asics",
        price: 9499,
        originalPrice: 11999,
        discount: 21,
        category: "Running",
        image: IMAGES.running_asics,
        sizes: [8, 9, 10, 11, 12],
        description: "Feel like you're running on clouds with superior shock absorption.",
        isSale: true
    },

    // Sneakers
    {
        id: 4,
        name: "Air Jordan Legacy",
        brand: "Jordan",
        price: 16995,
        originalPrice: 16995,
        discount: 0,
        category: "Sneakers",
        image: IMAGES.air_jordan_legacy_fix,
        sizes: [9, 10, 11, 12, 13],
        description: "Iconic design meets modern comfort. The legacy continues.",
        isSale: false
    },
    {
        id: 5,
        name: "Dunk Low Retro",
        brand: "Nike",
        price: 9695,
        originalPrice: 9695,
        discount: 0,
        category: "Sneakers",
        image: IMAGES.nike_air,
        sizes: [7, 8, 9, 10, 11],
        description: "Classic basketball style updated for the streets.",
        isSale: false
    },
    {
        id: 6,
        name: "Yeezy Boost 350",
        brand: "Adidas",
        price: 21999,
        originalPrice: 21999,
        discount: 0,
        category: "Sneakers",
        image: IMAGES.yeezy_fix,
        sizes: [8, 9, 10, 11],
        description: "Distinctive design with Primeknit upper.",
        isSale: false
    },
    {
        id: 7,
        name: "Classic Chucks",
        brand: "Converse",
        price: 4999,
        originalPrice: 4999,
        discount: 0,
        category: "Sneakers",
        image: IMAGES.converse,
        sizes: [5, 6, 7, 8, 9, 10, 11, 12],
        description: "The definitive sneaker, redesigned for comfort.",
        isSale: false
    },

    // Casual
    {
        id: 8,
        name: "Stan Smith",
        brand: "Adidas",
        price: 6999,
        originalPrice: 8499,
        discount: 17,
        category: "Casual",
        image: IMAGES.adidas_white,
        sizes: [6, 7, 8, 9, 10],
        description: "Minimalist leather sneaker used by the tennis legend.",
        isSale: true
    },
    {
        id: 9,
        name: "Air Force 1 '07",
        brand: "Nike",
        price: 8995,
        originalPrice: 8995,
        discount: 0,
        category: "Casual",
        image: IMAGES.nike_white,
        colors: [
            { name: "White", hex: "#FFFFFF", image: IMAGES.nike_white },
            { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600" }
        ],
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The legend lives on in the Nike Air Force 1 '07.",
        isSale: false
    },
    {
        id: 10,
        name: "Old Skool",
        brand: "Vans",
        price: 5999,
        originalPrice: 5999,
        discount: 0,
        category: "Casual",
        image: IMAGES.vans,
        sizes: [6, 7, 8, 9, 10, 11],
        description: "Classic skate shoe and first to bare the iconic sidestripe.",
        isSale: false
    },

    // Formal
    {
        id: 11,
        name: "Oxford Cap Toe",
        brand: "Clarks",
        price: 8999,
        originalPrice: 12999,
        discount: 30,
        category: "Formal",
        image: IMAGES.formal_oxford,
        sizes: [8, 9, 10, 11],
        description: "Timeless elegance with premium leather construction.",
        isSale: true
    },
    {
        id: 12,
        name: "Modern Loafer",
        brand: "Cole Haan",
        price: 11999,
        originalPrice: 11999,
        discount: 0,
        category: "Formal",
        image: IMAGES.formal_loafer,
        sizes: [8, 9, 10, 11, 12],
        description: "Sophisticated slip-on for the modern gentleman.",
        isSale: false
    },
    {
        id: 13,
        name: "Wingtip Brogue",
        brand: "Allen Edmonds",
        price: 24999,
        originalPrice: 32999,
        discount: 24,
        category: "Formal",
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600",
        sizes: [9, 10, 11],
        description: "Handcrafted detailing sets this shoe apart.",
        isSale: true
    },

    // Boots
    {
        id: 14,
        name: "Premium 6-Inch",
        brand: "Timberland",
        price: 15995,
        originalPrice: 15995,
        discount: 0,
        category: "Boots",
        image: IMAGES.premium_6_inch_fix,
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The original yellow boot that started it all.",
        isSale: false
    },
    {
        id: 15,
        name: "Chelsea Boot",
        brand: "Dr. Martens",
        price: 13999,
        originalPrice: 13999,
        discount: 0,
        category: "Boots",
        image: IMAGES.chelsea_fix,
        sizes: [6, 7, 8, 9, 10, 11],
        description: "Easy-on, easy-off elasticized ankle.",
        isSale: false
    },
    {
        id: 16,
        name: "Desert Boot",
        brand: "Clarks",
        price: 10999,
        originalPrice: 10999,
        discount: 0,
        category: "Boots",
        image: IMAGES.desert_boot_fix,
        sizes: [7, 8, 9, 10, 11, 12],
        description: "Cult classic inspired by British Army boots.",
        isSale: false
    },

    // Sandals
    {
        id: 17,
        name: "Arizona",
        brand: "Birkenstock",
        price: 8995,
        originalPrice: 8995,
        discount: 0,
        category: "Sandals",
        image: IMAGES.arizona_fix,
        sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        description: "The legendary two-strap design.",
        isSale: false
    },
    {
        id: 18,
        name: "Adilette Slide",
        brand: "Adidas",
        price: 2999,
        originalPrice: 3999,
        discount: 25,
        category: "Sandals",
        image: IMAGES.adidas_white,
        sizes: [6, 7, 8, 9, 10, 11, 12],
        description: "Go-to slides for post-workout or poolside.",
        isSale: true
    },

    // Sports (General)
    {
        id: 19,
        name: "Metcon 9",
        brand: "Nike",
        price: 12995,
        originalPrice: 12995,
        discount: 0,
        category: "Sports",
        image: IMAGES.running_blue,
        sizes: [7, 8, 9, 10, 11, 12],
        description: "The gold standard for weightlifting and cross-training.",
        isSale: false
    },
    {
        id: 20,
        name: "Nano X3",
        brand: "Reebok",
        price: 11499,
        originalPrice: 11499,
        discount: 0,
        category: "Sports",
        image: IMAGES.reebok_nano, // Fixed image
        sizes: [7, 8, 9, 10, 11],
        description: "Versatile training shoe with Lift and Run Chassis.",
        isSale: false
    },
    {
        id: 21,
        name: "Curry Flow",
        brand: "Under Armour",
        price: 13999,
        originalPrice: 13999,
        discount: 0,
        category: "Sports",
        image: IMAGES.jordan_low,
        sizes: [8, 9, 10, 11, 12],
        description: "Totally rubberless, so it's lighter and grippier.",
        isSale: false
    },

    // Hiking
    {
        id: 22,
        name: "Moab 3",
        brand: "Merrell",
        price: 9999,
        originalPrice: 9999,
        discount: 0,
        category: "Hiking",
        image: IMAGES.hiking,
        sizes: [7, 8, 9, 10, 11, 12],
        description: "The mother of all boots, now even more durable.",
        isSale: false
    },
    {
        id: 23,
        name: "X Ultra 4",
        brand: "Salomon",
        price: 14999,
        originalPrice: 14999,
        discount: 0,
        category: "Hiking",
        image: IMAGES.x_ultra_4_fix,
        sizes: [8, 9, 10, 11],
        description: "Agile as a trail runner but with stability related grip.",
        isSale: false
    },

    // More Styles
    {
        id: 24,
        name: "Slip-On",
        brand: "Vans",
        price: 4995,
        originalPrice: 4995,
        discount: 0,
        category: "Casual",
        image: IMAGES.vans,
        sizes: [6, 7, 8, 9, 10, 11, 12],
        description: "Sturdy low profile slip-on canvas uppers.",
        isSale: false
    },
    {
        id: 25,
        name: "Gazelle",
        brand: "Adidas",
        price: 8599,
        originalPrice: 8599,
        discount: 0,
        category: "Casual",
        image: "https://images.unsplash.com/photo-1597248881519-db089d3744a5?auto=format&fit=crop&q=80&w=600",
        sizes: [7, 8, 9, 10, 11],
        description: "Ultimate simplicity for three decades and counting.",
        isSale: false
    },
    {
        id: 26,
        name: "Gel-Kayano 30",
        brand: "Asics",
        price: 13999,
        originalPrice: 13999,
        discount: 0,
        category: "Running",
        image: IMAGES.running_asics,
        sizes: [8, 9, 10, 11, 12],
        description: "Advanced stability for your run.",
        isSale: false
    },
    {
        id: 27,
        name: "Zoom Fly 5",
        brand: "Nike",
        price: 14495,
        originalPrice: 14495,
        discount: 0,
        category: "Running",
        image: IMAGES.nike_red,
        sizes: [7, 8, 9, 10, 11],
        description: "Bridge the gap between weekend training run and race day.",
        isSale: false
    },
    {
        id: 28,
        name: "Wave Rider 27",
        brand: "Mizuno",
        price: 11999,
        originalPrice: 11999,
        discount: 0,
        category: "Running",
        image: "https://images.unsplash.com/photo-1597248881519-db089d3744a5?auto=format&fit=crop&q=80&w=600",
        sizes: [8, 9, 10, 11],
        description: "Balanced cushioning and stability.",
        isSale: false
    },
    {
        id: 29,
        name: "Ghost 15",
        brand: "Brooks",
        price: 11999,
        originalPrice: 11999,
        discount: 0,
        category: "Running",
        image: IMAGES.running_blue,
        sizes: [7, 8, 9, 10, 11, 12],
        description: "Smoothest ride possible for distract-free running.",
        isSale: false
    },
    {
        id: 30,
        name: "Clifton 9",
        brand: "Hoka",
        price: 12499,
        originalPrice: 12499,
        discount: 0,
        category: "Running",
        image: IMAGES.nike_white,
        sizes: [7, 8, 9, 10, 11],
        description: "Light and plush for everyday miles.",
        isSale: false
    },
    {
        id: 31,
        name: "Pegasus 40",
        brand: "Nike",
        price: 10995,
        originalPrice: 10995,
        discount: 0,
        category: "Running",
        image: IMAGES.nike_red,
        sizes: [6, 7, 8, 9, 10, 11, 12],
        description: "A springy ride for every run.",
        isSale: false
    }
];

const productsWithColors = products.map(p => ({
    ...p,
    colors: p.colors || STANDARD_COLORS
}));

module.exports = { categories, products: productsWithColors };
