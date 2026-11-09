const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Bitme Sri Lanka Marketplace...");

  // Clean old records
  await prisma.auditLog.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.autoBidRule.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.sellerVerification.deleteMany({});
  await prisma.sellerProfile.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.userIdentity.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const buyer = await prisma.user.create({
    data: {
      id: "usr_buyer_101",
      name: "Kasun Jayasuriya",
      email: "kasun.buyer@example.com",
      phone: "+94771234567",
      role: "VERIFIED_SELLER",
      isEmailVerified: true,
      isPhoneVerified: true,
      buyerScore: 98,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      sellerProfile: {
        create: {
          storeName: "Kasun Curated Emporium",
          storeSlug: "kasun-emporium",
          description: "Curated collector of fine horology, luxury automobiles and certified gems.",
          reputationScore: 4.95,
          totalSales: 18,
          isVerified: true,
          verificationLevel: "NIC_AND_BUSINESS",
        },
      },
      profile: {
        create: {
          bio: "Tech enthusiast and vintage collector based in Colombo.",
          district: "Colombo",
          province: "Western",
          preferredLanguage: "EN",
        },
      },
      addresses: {
        create: {
          title: "Home",
          street: "42/A, Galle Road",
          city: "Kollupitiya",
          district: "Colombo",
          province: "Western",
          postalCode: "00300",
          isDefault: true,
        },
      },
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      id: "usr_seller_202",
      name: "Dilshan Tech Hub",
      email: "dilshan.seller@example.com",
      phone: "+94719876543",
      role: "VERIFIED_SELLER",
      isEmailVerified: true,
      isPhoneVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      sellerProfile: {
        create: {
          storeName: "Dilshan Tech Lanka (Pvt) Ltd",
          storeSlug: "dilshan-tech",
          description: "Authorized importer of professional mirrorless cameras, gaming laptops, and certified electronics in Sri Lanka.",
          verificationLevel: "VERIFIED_SELLER",
          isVerified: true,
          reputationScore: 4.95,
          totalSales: 142,
          successfulDeliveries: 139,
          verifications: {
            create: {
              documentType: "BUSINESS_REGISTRATION",
              documentNumber: "PV-129845",
              status: "APPROVED",
              adminNotes: "Official Department of Registrar of Companies verified.",
            },
          },
        },
      },
    },
    include: { sellerProfile: true },
  });

  const gemSellerUser = await prisma.user.create({
    data: {
      id: "usr_seller_303",
      name: "Ratnapura Gem Emporium",
      email: "gems@ratnapuragem.lk",
      phone: "+94452223344",
      role: "VERIFIED_SELLER",
      isEmailVerified: true,
      isPhoneVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      sellerProfile: {
        create: {
          storeName: "Ceylon Sapphire Vault",
          storeSlug: "ceylon-sapphire-vault",
          description: "Certified natural unheated Ceylon gemstones directly from the mines of Ratnapura.",
          verificationLevel: "VERIFIED_SELLER",
          isVerified: true,
          reputationScore: 5.0,
          totalSales: 89,
          successfulDeliveries: 89,
        },
      },
    },
    include: { sellerProfile: true },
  });

  const admin = await prisma.user.create({
    data: {
      id: "usr_admin_001",
      name: "Bitme Compliance Officer",
      email: "admin@bitme.lk",
      phone: "+94112334455",
      role: "SUPER_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Categories
  const catWatches = await prisma.category.create({
    data: {
      name: "Luxury Watches & Fine Jewelry",
      slug: "watches",
      icon: "Watch",
      description: "Rolex, Patek Philippe, Audemars Piguet, Omega & Fine Gold Jewelry",
    },
  });

  const catVehicles = await prisma.category.create({
    data: {
      name: "Vehicles & Supercars",
      slug: "vehicles",
      icon: "Car",
      description: "Supercars, Classic Vintage Cars, Land Cruisers & Motorcycles",
    },
  });

  const catRealEstate = await prisma.category.create({
    data: {
      name: "Real Estate & Prime Property",
      slug: "realestate",
      icon: "Building2",
      description: "Colombo Luxury Condos, Beachfront Villas, Commercial Land Lots",
    },
  });

  const catCameras = await prisma.category.create({
    data: {
      name: "High-End Tech & Cameras",
      slug: "electronics",
      icon: "Camera",
      description: "DSLRs, Mirrorless, Gaming Laptops, Drones & Hardware",
    },
  });

  const catPhones = await prisma.category.create({
    data: {
      name: "Mobile Phones & Tablets",
      slug: "phones",
      icon: "Smartphone",
      description: "iPhones, Samsung Galaxy, iPads & smart accessories",
    },
  });

  const catLaptops = await prisma.category.create({
    data: {
      name: "Laptops & Computers",
      slug: "laptops",
      icon: "Laptop",
      description: "Gaming rigs, MacBooks, Ultrabooks & PC hardware",
    },
  });

  const catGems = await prisma.category.create({
    data: {
      name: "Ceylon Gemstones & Minerals",
      slug: "gems",
      icon: "Sparkles",
      description: "Ceylon Blue Sapphires, Padparadscha, Rubies & Fine Jewelry",
    },
  });

  const catAntiques = await prisma.category.create({
    data: {
      name: "Fine Art & Rare Antiques",
      slug: "antiques",
      icon: "Hourglass",
      description: "Dutch era artifacts, vintage coins, heirloom brassware",
    },
  });

  // 3. Products & Auctions

  // Auction 1: Sony A7 III
  const prodSony = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catCameras.id,
      title: "Sony Alpha A7 III Mirrorless Camera (with 28-70mm OSS Lens)",
      slug: "sony-alpha-a7iii-mirrorless-camera",
      description: "Professional full-frame mirrorless camera in mint condition. Low shutter count of just 4,200 clicks. Includes original box, Sony NP-FZ100 battery, charging block, strap, and 28-70mm f/3.5-5.6 OSS zoom lens. Ideal for wedding photography and 4K cinema video work in Sri Lanka.",
      brand: "Sony",
      model: "ILCE-7M3",
      condition: "USED_EXCELLENT",
      attributes: JSON.stringify({
        sensor: "24.2MP Full-Frame Exmor R BSI CMOS",
        shutterCount: 4200,
        video: "4K HDR 30fps / 1080p 120fps",
        stabilization: "5-Axis SteadyShot INSIDE",
        warranty: "6 Months Seller Warranty",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80", isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  const endsAtSony = new Date(Date.now() + 3.5 * 3600 * 1000); // 3.5 hours from now
  const auctionSony = await prisma.auction.create({
    data: {
      id: "auc_sony_a7iii",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodSony.id,
      categoryId: catCameras.id,
      title: "Sony Alpha A7 III Mirrorless Camera + 28-70mm Lens Kit",
      slug: "sony-alpha-a7-iii-mirrorless-colombo",
      auctionType: "STANDARD",
      status: "LIVE",
      startingPrice: 120000,
      currentPrice: 145000,
      reservePrice: 135000,
      buyNowPrice: 185000,
      bidIncrement: 1000,
      startsAt: new Date(Date.now() - 24 * 3600 * 1000),
      endsAt: endsAtSony,
      totalBids: 14,
      viewCount: 680,
      locationDistrict: "Colombo",
      shippingDetails: "Islandwide insured courier delivery (Rs. 650) or hand pickup at Bambalapitiya store.",
      bids: {
        create: [
          { bidderId: buyer.id, amount: 125000, createdAt: new Date(Date.now() - 12 * 3600 * 1000) },
          { bidderId: admin.id, amount: 132000, createdAt: new Date(Date.now() - 6 * 3600 * 1000) },
          { bidderId: buyer.id, amount: 145000, createdAt: new Date(Date.now() - 1 * 3600 * 1000) },
        ],
      },
    },
  });

  // Auction 2: iPhone 15 Pro (Ending Soon!)
  const prodIPhone = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catPhones.id,
      title: "Apple iPhone 15 Pro 128GB - Natural Titanium (TRCSL Approved)",
      slug: "apple-iphone-15-pro-natural-titanium",
      description: "Official Apple iPhone 15 Pro 128GB in pristine Natural Titanium finish. 100% Battery Health with only 24 cycles. Factory unlocked, TRCSL registered with duty paid proof. Comes with original braided USB-C cable and box.",
      brand: "Apple",
      model: "iPhone 15 Pro (A3101)",
      condition: "LIKE_NEW",
      attributes: JSON.stringify({
        chip: "A17 Pro 3nm Bionic",
        display: "6.1 Super Retina XDR 120Hz ProMotion",
        storage: "128GB",
        batteryHealth: "100%",
        trcsl: "Approved & Customs Verified",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80", isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  const endsAtIPhone = new Date(Date.now() + 18 * 60 * 1000); // 18 minutes from now! (Ending soon)
  await prisma.auction.create({
    data: {
      id: "auc_iphone15pro",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodIPhone.id,
      categoryId: catPhones.id,
      title: "Apple iPhone 15 Pro 128GB Natural Titanium (TRCSL Approved)",
      slug: "apple-iphone-15-pro-titanium-kandy",
      auctionType: "STANDARD",
      status: "LIVE",
      startingPrice: 190000,
      currentPrice: 215000,
      reservePrice: 200000,
      buyNowPrice: 245000,
      bidIncrement: 2500,
      startsAt: new Date(Date.now() - 48 * 3600 * 1000),
      endsAt: endsAtIPhone,
      totalBids: 26,
      viewCount: 1420,
      locationDistrict: "Colombo",
      shippingDetails: "Same-day Colombo delivery via PromptX or pickup at Kollupitiya.",
      bids: {
        create: [
          { bidderId: buyer.id, amount: 200000, createdAt: new Date(Date.now() - 5 * 3600 * 1000) },
          { bidderId: admin.id, amount: 210000, createdAt: new Date(Date.now() - 2 * 3600 * 1000) },
          { bidderId: buyer.id, amount: 215000, createdAt: new Date(Date.now() - 20 * 60 * 1000) },
        ],
      },
    },
  });

  // Auction 3: Gaming Laptop
  const prodLaptop = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catLaptops.id,
      title: "ASUS ROG Strix G16 Gaming Laptop (Core i7 13th Gen / RTX 4060 / 32GB RAM)",
      slug: "asus-rog-strix-g16-gaming-laptop",
      description: "Unmatched performance beast for gaming and 4K content creation. Intel Core i7-13650HX 14-core processor, NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP), 32GB DDR5 dual-channel RAM, 1TB NVMe PCIe 4.0 SSD. 165Hz ROG Nebula Display with 100% sRGB.",
      brand: "ASUS",
      model: "ROG Strix G16 (G614JV)",
      condition: "USED_EXCELLENT",
      attributes: JSON.stringify({
        cpu: "Intel Core i7-13650HX",
        gpu: "NVIDIA RTX 4060 8GB (140W)",
        ram: "32GB DDR5 4800MHz",
        storage: "1TB PCIe Gen4 SSD",
        display: "16-inch FHD+ 165Hz 100% sRGB",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
          { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80", isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  const endsAtLaptop = new Date(Date.now() + 2.5 * 3600 * 1000);
  await prisma.auction.create({
    data: {
      id: "auc_rog_strix_g16",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodLaptop.id,
      categoryId: catLaptops.id,
      title: "ASUS ROG Strix G16 Gaming Laptop (RTX 4060, 32GB RAM, 1TB SSD)",
      slug: "asus-rog-strix-g16-rtx4060-gampaha",
      auctionType: "STANDARD",
      status: "LIVE",
      startingPrice: 260000,
      currentPrice: 285000,
      reservePrice: 275000,
      buyNowPrice: 330000,
      bidIncrement: 2500,
      startsAt: new Date(Date.now() - 10 * 3600 * 1000),
      endsAt: endsAtLaptop,
      totalBids: 18,
      viewCount: 910,
      locationDistrict: "Gampaha",
      shippingDetails: "Free insured delivery to Colombo and Gampaha districts. Islandwide courier available.",
      bids: {
        create: [
          { bidderId: buyer.id, amount: 270000, createdAt: new Date(Date.now() - 4 * 3600 * 1000) },
          { bidderId: admin.id, amount: 280000, createdAt: new Date(Date.now() - 2 * 3600 * 1000) },
          { bidderId: buyer.id, amount: 285000, createdAt: new Date(Date.now() - 45 * 60 * 1000) },
        ],
      },
    },
  });

  // Auction 4: Ceylon Blue Sapphire
  const prodSapphire = await prisma.product.create({
    data: {
      sellerId: gemSellerUser.sellerProfile.id,
      categoryId: catGems.id,
      title: "Natural Ceylon Royal Blue Sapphire (3.15 Carats, Certified Unheated)",
      slug: "natural-ceylon-royal-blue-sapphire-unheated",
      description: "Exquisite untreated Royal Blue Sapphire with exceptional luster and vitreous brilliance. Sourced directly from private family mines in Kiriella, Ratnapura. Includes comprehensive gemstone testing certificate from the Gemological Institute of Ceylon (GIC).",
      brand: "Ceylon Gems",
      model: "Royal Blue Cushion Cut",
      condition: "BRAND_NEW",
      attributes: JSON.stringify({
        weight: "3.15 Carats",
        clarity: "Eye Clean (VVS)",
        origin: "Ratnapura, Sri Lanka",
        treatment: "Unheated / 100% Natural",
        certificate: "GIC-LK #44921",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
        ],
      },
    },
  });

  const endsAtSapphire = new Date(Date.now() + 6 * 3600 * 1000);
  await prisma.auction.create({
    data: {
      id: "auc_ceylon_sapphire",
      sellerId: gemSellerUser.sellerProfile.id,
      productId: prodSapphire.id,
      categoryId: catGems.id,
      title: "Certified 3.15ct Ceylon Royal Blue Sapphire (Ratnapura Mined)",
      slug: "certified-ceylon-blue-sapphire-ratnapura",
      auctionType: "RESERVE",
      status: "LIVE",
      startingPrice: 110000,
      currentPrice: 135000,
      reservePrice: 140000,
      bidIncrement: 2500,
      startsAt: new Date(Date.now() - 14 * 3600 * 1000),
      endsAt: endsAtSapphire,
      totalBids: 11,
      viewCount: 1150,
      locationDistrict: "Ratnapura",
      shippingDetails: "Insured high-value escort delivery or secure collection at World Trade Center, Colombo.",
    },
  });

  // Auction 5: Antique Dutch Brass Lamp
  const prodLamp = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catAntiques.id,
      title: "Authentic Dutch Era Heavy Hand-Cast Brass Temple Arch Lamp (Circa 1890)",
      slug: "dutch-era-heavy-brass-temple-lamp",
      description: "Magnificent colonial era brass oil lamp with detailed peacock arch motif (Makara Thorana). Passed down through three generations in Southern Province. Rich natural antique patina, fully intact without any cracks or structural repairs.",
      brand: "Colonial Ceylon",
      model: "Heirloom Arch Brassware",
      condition: "USED_GOOD",
      attributes: JSON.stringify({
        age: "Circa 1890 (Late Dutch/Early British Ceylon)",
        material: "Solid Hand-Cast Brass",
        height: "28 Inches",
        weight: "6.8 Kilograms",
        provenance: "Galle Fort Estate Collection",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
        ],
      },
    },
  });

  const endsAtLamp = new Date(Date.now() + 8.5 * 3600 * 1000);
  await prisma.auction.create({
    data: {
      id: "auc_dutch_lamp",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodLamp.id,
      categoryId: catAntiques.id,
      title: "Dutch Era Antique Brass Peacock Arch Lamp (1890s Galle Heritage)",
      slug: "antique-dutch-era-brass-lamp-galle",
      auctionType: "STANDARD",
      status: "LIVE",
      startingPrice: 35000,
      currentPrice: 42500,
      reservePrice: 40000,
      bidIncrement: 500,
      startsAt: new Date(Date.now() - 36 * 3600 * 1000),
      endsAt: endsAtLamp,
      totalBids: 9,
      viewCount: 420,
      locationDistrict: "Galle",
      shippingDetails: "Heavy cargo specialized wooden crate dispatch islandwide or Galle Fort pickup.",
    },
  });

  // Auction 6: Rolex Submariner Date (Luxury Watch)
  const prodRolex = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catWatches.id,
      title: "Rolex Submariner Date 41mm Oystersteel (Ref. 126610LN) - Complete Box & Papers",
      slug: "rolex-submariner-date-41mm-oystersteel",
      description: "Iconic luxury divers watch in unworn mint condition. Calibre 3235 automatic movement with 70-hour power reserve. Unidirectional rotatable Cerachrom bezel in black ceramic. Comes with original green presentation box, warranty card dated 2024, manual, and tags.",
      brand: "Rolex",
      model: "Submariner Date 126610LN",
      condition: "LIKE_NEW",
      attributes: JSON.stringify({
        movement: "Automatic Calibre 3235",
        powerReserve: "70 Hours",
        caseSize: "41mm Oystersteel",
        bezel: "Cerachrom Black Ceramic",
        authenticity: "100% Certified with NFC Card",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
        ],
      },
    },
  });

  const endsAtRolex = new Date(Date.now() + 4 * 3600 * 1000);
  await prisma.auction.create({
    data: {
      id: "auc_rolex_submariner",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodRolex.id,
      categoryId: catWatches.id,
      title: "Rolex Submariner Date 41mm Oystersteel (Box & Papers 2024)",
      slug: "rolex-submariner-date-41mm-colombo",
      auctionType: "RESERVE",
      status: "LIVE",
      startingPrice: 1850000,
      currentPrice: 2100000,
      reservePrice: 2000000,
      buyNowPrice: 2450000,
      bidIncrement: 5000,
      startsAt: new Date(Date.now() - 18 * 3600 * 1000),
      endsAt: endsAtRolex,
      totalBids: 22,
      viewCount: 2340,
      locationDistrict: "Colombo",
      shippingDetails: "Armored escort secure dispatch or Bank Safe Deposit Box handover in Colombo 01.",
    },
  });

  // Auction 7: Porsche 911 GT3 (Vehicles & Supercars)
  const prodPorsche = await prisma.product.create({
    data: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: catVehicles.id,
      title: "Porsche 911 GT3 Touring (992 Generation) - Guards Red / Clubsport Spec",
      slug: "porsche-911-gt3-touring-992",
      description: "Naturally aspirated 4.0-litre flat-six engine revving up to 9,000 RPM producing 502 HP. 7-speed dual-clutch PDK transmission, front-axle lift system, carbon ceramic brakes (PCCB), and lightweight full bucket seats.",
      brand: "Porsche",
      model: "911 GT3 Touring (992)",
      condition: "USED_EXCELLENT",
      attributes: JSON.stringify({
        engine: "4.0L Naturally Aspirated Flat-6",
        horsepower: "502 HP @ 8,400 RPM",
        mileage: "6,200 km",
        brakes: "Porsche Ceramic Composite (PCCB)",
        registration: "Sri Lanka Registered (Duty Paid)",
      }),
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80", isPrimary: true, sortOrder: 0 },
        ],
      },
    },
  });

  const endsAtPorsche = new Date(Date.now() + 12 * 3600 * 1000);
  await prisma.auction.create({
    data: {
      id: "auc_porsche_gt3",
      sellerId: sellerUser.sellerProfile.id,
      productId: prodPorsche.id,
      categoryId: catVehicles.id,
      title: "Porsche 911 GT3 (992) Touring Package - Sri Lanka Registered",
      slug: "porsche-911-gt3-supercar-colombo",
      auctionType: "RESERVE",
      status: "LIVE",
      startingPrice: 48000000,
      currentPrice: 52500000,
      reservePrice: 50000000,
      bidIncrement: 50000,
      startsAt: new Date(Date.now() - 24 * 3600 * 1000),
      endsAt: endsAtPorsche,
      totalBids: 17,
      viewCount: 4890,
      locationDistrict: "Colombo",
      shippingDetails: "Enclosed flatbed transporter delivery across Sri Lanka or vehicle viewing at Colombo 07 showroom.",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
