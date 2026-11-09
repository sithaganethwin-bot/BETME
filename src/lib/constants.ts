export const SRI_LANKAN_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", 
  "Kandy", "Matale", "Nuwara Eliya", 
  "Galle", "Matara", "Hambantota", 
  "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", 
  "Batticaloa", "Ampara", "Trincomalee", 
  "Kurunegala", "Puttalam", 
  "Anuradhapura", "Polonnaruwa", 
  "Badulla", "Monaragala", 
  "Ratnapura", "Kegalle"
] as const;

export const SRI_LANKAN_PROVINCES = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa"
] as const;

export const CATEGORIES_CONFIG = [
  {
    name: "Luxury Watches & Fine Jewelry",
    slug: "watches",
    icon: "Watch",
    description: "Rolex, Patek Philippe, Audemars Piguet, Omega & Fine Gold Jewelry",
  },
  {
    name: "Vehicles & Supercars",
    slug: "vehicles",
    icon: "Car",
    description: "Supercars, Classic Vintage Cars, Land Cruisers & Motorcycles",
  },
  {
    name: "Real Estate & Prime Property",
    slug: "realestate",
    icon: "Building2",
    description: "Colombo Luxury Condos, Beachfront Villas, Commercial Land Lots",
  },
  {
    name: "Computers & Gaming Laptops",
    slug: "computers",
    icon: "Laptop",
    description: "RTX Gaming Rigs, Apple MacBook Pro, Workstations & Gaming Consoles",
  },
  {
    name: "Cameras & Cinema Gear",
    slug: "cameras",
    icon: "Camera",
    description: "Sony Alpha, Canon EOS, RED Cinema, Leica & Prime Cinema Lenses",
  },
  {
    name: "Phones & Mobile Tech",
    slug: "phones",
    icon: "Smartphone",
    description: "iPhone 15 Pro, Samsung Galaxy Ultra, TRCSL Approved Flagships",
  },
  {
    name: "Ceylon Gemstones & Minerals",
    slug: "gems",
    icon: "Gem",
    description: "Certified Royal Blue Sapphires, Padparadscha, Rubies & Fine Gems",
  },
  {
    name: "Fine Art & Rare Antiques",
    slug: "antiques",
    icon: "Hourglass",
    description: "Museum-grade artifacts, colonial heirlooms, original oil paintings",
  },
  {
    name: "Designer Fashion & Rare Goods",
    slug: "fashion",
    icon: "Shirt",
    description: "Hermès, Chanel, Louis Vuitton & Limited Collector Streetwear",
  },
  {
    name: "Musical Instruments & Audio",
    slug: "audio",
    icon: "Music",
    description: "Fender, Gibson, Yamaha Grand Pianos, Synthesizers & Studio Gear",
  },
  {
    name: "Heavy Machinery & Industrial",
    slug: "machinery",
    icon: "Cog",
    description: "Excavators, Commercial Generators, Industrial Factory Equipment",
  },
  {
    name: "Home, Living & Interior",
    slug: "home",
    icon: "Armchair",
    description: "Solid Teak Furniture, Architectural Fixtures, Luxury Appliances",
  },
  {
    name: "Sports, Marine & Outdoors",
    slug: "sports",
    icon: "Compass",
    description: "Speedboats, Jet Skis, High-End Bicycles, Golf Sets & Fitness Gear",
  },
  {
    name: "Collectibles & Memorabilia",
    slug: "collectibles",
    icon: "Award",
    description: "Vintage Coins, Rare Stamps, Historical Sri Lankan Currency & Signed Memorabilia",
  }
];

export const MOCK_USERS = {
  buyer: {
    id: "usr_buyer_101",
    name: "Kasun Jayasuriya",
    email: "kasun.buyer@example.com",
    role: "BUYER",
    district: "Colombo",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    buyerScore: 98,
  },
  seller: {
    id: "usr_seller_202",
    name: "Dilshan Tech Hub",
    email: "dilshan.seller@example.com",
    role: "VERIFIED_SELLER",
    district: "Colombo",
    storeName: "Dilshan Global Emporium (Pvt) Ltd",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    reputationScore: 4.95,
  },
  admin: {
    id: "usr_admin_001",
    name: "Bidme Compliance Officer",
    email: "admin@bidme.lk",
    role: "SUPER_ADMIN",
    district: "Colombo",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  }
};
