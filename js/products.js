const products = [
    {
        id: 1,
        name: "Suni Deri Boxy Fit Ceket",
        category: "ceket", // Kategori filtreleme için önemli!
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        price: "2.490,00 TL",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        sizes: ["XS", "S", "M", "L"],
        description: "Her dolapta olması gereken basic parça."
    },
    {
        id: 2,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 8,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 4,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 5,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 6,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 7,
        name: "Suni Deri Ceket",
        category: "ceket",
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 9,
        name: "Suni Deri Ceket",
        category: ["ceket", "indirim"],
        price: "2.090,00 TL",
        oldPrice: "2.990,00 TL", // İndirim varsa
        discount: "-%30",       // İndirim oranı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/giris/erkek.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 3,
        name: "Fermuarlı Boxy Fit Flanel Ceket",
        category: "gomlek",
        price: "1.600,00 TL",
        oldPrice: "2.290,00 TL",
        discount: "-%30",
        tag: "KAMPANYA ONLINE", // Kırmızı yazı
        ref: "5348/534/800",
        modelInfo: "Modelin boyu: 186 cm - Beden 40",
        images: ["images/new.jpg","images/slider/man2.jpg"],
        colors: [{ code: "#1a1a1a", name: "Siyah" } ],
        description: "Her dolapta olması gereken basic parça.",
        sizes: ["M", "L"]
    }
];
