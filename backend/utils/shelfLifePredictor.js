// Shelf Life Prediction Model
const shelfLifeData = {
  "fruits": [
    {
      "product_english": "Apple",
      "product_tagalog": "Mansanas",
      "fridge_life_days": 30,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Banana",
      "product_tagalog": "Saging",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Orange",
      "product_tagalog": "Dalandan",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Mango",
      "product_tagalog": "Mangga",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Grapes",
      "product_tagalog": "Ubas",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Strawberry",
      "product_tagalog": "Strawberry",
      "fridge_life_days": 5,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Pineapple",
      "product_tagalog": "Pinya",
      "fridge_life_days": 3,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Watermelon",
      "product_tagalog": "Pakwan",
      "fridge_life_days": 15,
      "pantry_room_temp_life_days": 8
    },
    {
      "product_english": "Papaya",
      "product_tagalog": "Papaya",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Lemon",
      "product_tagalog": "Kalamansi",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 8
    },
    {
      "product_english": "Lime",
      "product_tagalog": "Lemon",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 8
    },
    {
      "product_english": "Coconut",
      "product_tagalog": "Buko",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Niyog",
      "product_tagalog": "Niyog",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Avocado",
      "product_tagalog": "Avocado",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Kiwi",
      "product_tagalog": "Kiwi",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Peach",
      "product_tagalog": "Melokoton",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Pear",
      "product_tagalog": "Peras",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Plum",
      "product_tagalog": "Siruela",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Blueberry",
      "product_tagalog": "Blueberry",
      "fridge_life_days": 7,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Raspberry",
      "product_tagalog": "Raspberry",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Blackberry",
      "product_tagalog": "Blackberry",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Pomegranate",
      "product_tagalog": "Granada",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 6
    },
    {
      "product_english": "Cantaloupe",
      "product_tagalog": "Melon",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 8
    },
    {
      "product_english": "Honeydew",
      "product_tagalog": "Melon",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 8
    },
    {
      "product_english": "Dragonfruit",
      "product_tagalog": "Dragonfruit",
      "fridge_life_days": 8,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Lychee",
      "product_tagalog": "Lychee",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Rambutan",
      "product_tagalog": "Rambutan",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Mangosteen",
      "product_tagalog": "Mangosteen",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Durian",
      "product_tagalog": "Durian",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Jackfruit",
      "product_tagalog": "Langka",
      "fridge_life_days": 5,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Soursop",
      "product_tagalog": "Guyabano",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Guyabano",
      "product_tagalog": "Guyabano",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Tamarind",
      "product_tagalog": "Sampalok",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Longan",
      "product_tagalog": "Longan",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Langsat",
      "product_tagalog": "Lanzones",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Lanzones",
      "product_tagalog": "Lanzones",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Santol",
      "product_tagalog": "Santol",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Star Apple",
      "product_tagalog": "Kaymito",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Kaymito",
      "product_tagalog": "Kaymito",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    }
  ],
  "vegetables": [
    {
      "product_english": "Tomato",
      "product_tagalog": "Kamatis",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 7
    },
    {
      "product_english": "Kamatis",
      "product_tagalog": "Kamatis",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 7
    },
    {
      "product_english": "Onion",
      "product_tagalog": "Sibuyas",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 60
    },
    {
      "product_english": "Sibuyas",
      "product_tagalog": "Sibuyas",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 60
    },
    {
      "product_english": "Garlic",
      "product_tagalog": "Bawang",
      "fridge_life_days": 120,
      "pantry_room_temp_life_days": 120
    },
    {
      "product_english": "Bawang",
      "product_tagalog": "Bawang",
      "fridge_life_days": 120,
      "pantry_room_temp_life_days": 120
    },
    {
      "product_english": "Potato",
      "product_tagalog": "Patatas",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 25
    },
    {
      "product_english": "Patatas",
      "product_tagalog": "Patatas",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 25
    },
    {
      "product_english": "Carrot",
      "product_tagalog": "Karot",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Karot",
      "product_tagalog": "Karot",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Cabbage",
      "product_tagalog": "Repolyo",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Repolyo",
      "product_tagalog": "Repolyo",
      "fridge_life_days": 45,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Lettuce",
      "product_tagalog": "Letsugas",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Letsugas",
      "product_tagalog": "Letsugas",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Spinach",
      "product_tagalog": "Spinach",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Kale",
      "product_tagalog": "Kale",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Kangkong",
      "product_tagalog": "Kangkong",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Pechay",
      "product_tagalog": "Pechay",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Mustasa",
      "product_tagalog": "Mustasa",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Broccoli",
      "product_tagalog": "Broccoli",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Cauliflower",
      "product_tagalog": "Cauliflower",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Bell Pepper",
      "product_tagalog": "Bell Pepper",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Chili",
      "product_tagalog": "Sili",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Sili",
      "product_tagalog": "Sili",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Eggplant",
      "product_tagalog": "Talong",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Talong",
      "product_tagalog": "Talong",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Cucumber",
      "product_tagalog": "Pipino",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Pipino",
      "product_tagalog": "Pipino",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Zucchini",
      "product_tagalog": "Zucchini",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Squash",
      "product_tagalog": "Kalabasa",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Kalabasa",
      "product_tagalog": "Kalabasa",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 4
    },
    {
      "product_english": "Sweet Potato",
      "product_tagalog": "Kamote",
      "fridge_life_days": 30,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Kamote",
      "product_tagalog": "Kamote",
      "fridge_life_days": 30,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Radish",
      "product_tagalog": "Labanos",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Labanos",
      "product_tagalog": "Labanos",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Celery",
      "product_tagalog": "Kintsay",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 6
    },
    {
      "product_english": "Kintsay",
      "product_tagalog": "Kintsay",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 6
    },
    {
      "product_english": "Asparagus",
      "product_tagalog": "Asparagus",
      "fridge_life_days": 3,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Green Beans",
      "product_tagalog": "Sitaw",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Sitaw",
      "product_tagalog": "Sitaw",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Snap Peas",
      "product_tagalog": "Sitsaro",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Sitsaro",
      "product_tagalog": "Sitsaro",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Corn",
      "product_tagalog": "Mais",
      "fridge_life_days": 2,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Mais",
      "product_tagalog": "Mais",
      "fridge_life_days": 2,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Mushroom",
      "product_tagalog": "Kabute",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Kabute",
      "product_tagalog": "Kabute",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Ginger",
      "product_tagalog": "Luya",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Luya",
      "product_tagalog": "Luya",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Turmeric",
      "product_tagalog": "Dilaw",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Dilaw",
      "product_tagalog": "Dilaw",
      "fridge_life_days": 25,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Malunggay",
      "product_tagalog": "Malunggay",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Moringa",
      "product_tagalog": "Malunggay",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Ampalaya",
      "product_tagalog": "Ampalaya",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Bitter Gourd",
      "product_tagalog": "Ampalaya",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Upo",
      "product_tagalog": "Upo",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Patola",
      "product_tagalog": "Patola",
      "fridge_life_days": 6,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Sayote",
      "product_tagalog": "Sayote",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 6
    },
    {
      "product_english": "Chayote",
      "product_tagalog": "Sayote",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 6
    },
    {
      "product_english": "Banana Blossom",
      "product_tagalog": "Puso ng Saging",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Puso ng Saging",
      "product_tagalog": "Puso ng Saging",
      "fridge_life_days": 4,
      "pantry_room_temp_life_days": 1
    },
    {
      "product_english": "Jicama",
      "product_tagalog": "Singkamas",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Singkamas",
      "product_tagalog": "Singkamas",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 10
    },
    {
      "product_english": "Taro",
      "product_tagalog": "Gabi",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Gabi",
      "product_tagalog": "Gabi",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Yam",
      "product_tagalog": "Ube",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Ube",
      "product_tagalog": "Ube",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Cassava",
      "product_tagalog": "Kamoteng Kahoy",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Kamoteng Kahoy",
      "product_tagalog": "Kamoteng Kahoy",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 5
    },
    {
      "product_english": "Brussels Sprouts",
      "product_tagalog": "Brussels Sprouts",
      "fridge_life_days": 10,
      "pantry_room_temp_life_days": 2
    },
    {
      "product_english": "Daikon",
      "product_tagalog": "Labanos (puting)",
      "fridge_life_days": 18,
      "pantry_room_temp_life_days": 4
    }
  ]
};

class ShelfLifePredictor {
    constructor() {
        this.data = shelfLifeData;
        this.allProducts = [...this.data.fruits, ...this.data.vegetables];
    }

    // Find product match with intelligent name matching
    findProductMatch(productName) {
        const searchTerm = productName.toLowerCase().trim();
        
        // First try exact match
        let match = this.allProducts.find(item => 
            item.product_english.toLowerCase() === searchTerm ||
            item.product_tagalog.toLowerCase() === searchTerm
        );

        // If no exact match, try partial matching
        if (!match) {
            match = this.allProducts.find(item => {
                const english = item.product_english.toLowerCase();
                const tagalog = item.product_tagalog.toLowerCase();
                
                return (
                    english.includes(searchTerm) || 
                    tagalog.includes(searchTerm) ||
                    searchTerm.includes(english) ||
                    searchTerm.includes(tagalog)
                );
            });
        }

        return match;
    }

    // Predict expiry date based on harvest date, storage location, and product
    predictExpiryDate(productName, harvestDate, storageLocation) {
        const productData = this.findProductMatch(productName);
        const harvest = new Date(harvestDate);
        
        let shelfLifeDays;
        
        if (productData) {
            // Use product-specific shelf life data
            if (storageLocation.toLowerCase() === 'fridge') {
                shelfLifeDays = productData.fridge_life_days;
            } else {
                // For pantry, room_temp, shelf, or any other storage
                shelfLifeDays = productData.pantry_room_temp_life_days;
            }
        } else {
            // Default shelf life for unknown products
            shelfLifeDays = storageLocation.toLowerCase() === 'fridge' ? 7 : 3;
        }

        // Calculate expiry date
        const expiryDate = new Date(harvest);
        expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

        return {
            productName: productName,
            matchedProduct: productData ? productData.product_english : null,
            harvestDate: harvest,
            storageLocation: storageLocation,
            shelfLifeDays: shelfLifeDays,
            expiryDate: expiryDate,
            isProductFound: !!productData
        };
    }

    // Get all available products
    getAllProducts() {
        return this.allProducts;
    }

    // Search products by name
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.allProducts.filter(product => 
            product.product_english.toLowerCase().includes(searchTerm) ||
            product.product_tagalog.toLowerCase().includes(searchTerm)
        );
    }
}

module.exports = ShelfLifePredictor;
