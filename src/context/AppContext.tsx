"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  district: string;
  address: string;
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  role: "BUYER" | "SELLER" | "BUYER_AND_SELLER" | "SUPER_ADMIN";
  sellerStatus: "NOT_STARTED" | "UNDER_REVIEW" | "APPROVED" | "SUSPENDED";
  preferredDashboard: "BUYER" | "SELLER";
  buyerScore: number;
  reputationScore: number;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  avatarUrl: string;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  title: string;
  sellerName: string;
  condition: string;
  price: number;
  imageUrl: string;
  quantity: number;
  deliveryFee: number;
  locationDistrict?: string;
}

export interface FavoriteItem {
  id: string;
  title: string;
  sellerName: string;
  currentPrice: number;
  startingPrice: number;
  imageUrl: string;
  endsAt: string | Date;
  status: "LIVE" | "ENDING_SOON" | "ENDED";
  totalBids: number;
  isOutbid?: boolean;
  isDirectPurchase?: boolean;
  buyNowPrice?: number | null;
  locationDistrict?: string;
}

export const DEFAULT_USER: UserProfile = {
  id: "usr_buyer_101",
  name: "Kasun Jayasuriya",
  email: "kasun.jayasuriya@example.com",
  phone: "+94 77 123 4567",
  nic: "199428102941",
  district: "Colombo",
  address: "No. 42/B, Ward Place, Colombo 07",
  bankName: "Commercial Bank of Ceylon",
  bankBranch: "Colombo Foreign Exchange Branch",
  bankAccount: "8009124810",
  role: "BUYER_AND_SELLER",
  sellerStatus: "APPROVED",
  preferredDashboard: "BUYER",
  buyerScore: 98,
  reputationScore: 4.95,
  storeName: "Kasun Curated Emporium",
  storeDescription: "Verified Sri Lankan consignor specializing in luxury certified timepieces, rare Ceylon gemstones, and TRCSL-approved tech gadgets.",
  storeLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  createdAt: "2024-01-15T09:30:00.000Z",
};

const INITIAL_CART: CartItem[] = [
  {
    id: "cart_item_sony",
    title: "Sony Alpha A7 III Mirrorless Camera + 28-70mm Lens Kit",
    sellerName: "Dilshan Tech Hub",
    condition: "Mint (Like New)",
    price: 275000,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    quantity: 1,
    deliveryFee: 1500,
    locationDistrict: "Colombo",
  },
];

const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: "auc_rolex_submariner",
    title: "Rolex Submariner Date 41mm Oystersteel (Box & Papers 2024)",
    sellerName: "Kasun Curated Emporium",
    currentPrice: 2100000,
    startingPrice: 1850000,
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
    endsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: "LIVE",
    totalBids: 22,
    isOutbid: false,
    buyNowPrice: 2500000,
    locationDistrict: "Colombo",
  },
  {
    id: "auc_iphone15pro",
    title: "Apple iPhone 15 Pro 128GB Natural Titanium (TRCSL Approved)",
    sellerName: "Dilshan Tech Hub",
    currentPrice: 2150000,
    startingPrice: 195000,
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80",
    endsAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    status: "ENDING_SOON",
    totalBids: 26,
    isOutbid: true,
    buyNowPrice: 240000,
    locationDistrict: "Colombo",
  },
  {
    id: "auc_ceylon_sapphire",
    title: "Certified 3.15ct Ceylon Royal Blue Sapphire (Ratnapura Mined)",
    sellerName: "Ceylon Sapphire Vault",
    currentPrice: 135000,
    startingPrice: 100000,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80",
    endsAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    status: "LIVE",
    totalBids: 11,
    isOutbid: false,
    buyNowPrice: 160000,
    locationDistrict: "Ratnapura",
  },
];

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  registerUser: (details: Partial<UserProfile>) => void;
  updateUserProfile: (details: Partial<UserProfile>) => void;
  submitSellerApplication: (data: {
    storeName: string;
    storeDescription: string;
    bankName: string;
    bankAccount: string;
    nic: string;
  }) => void;
  preferredDashboard: "BUYER" | "SELLER";
  setPreferredDashboard: (mode: "BUYER" | "SELLER") => void;
  language: "EN" | "SI" | "TA";
  setLanguage: (lang: "EN" | "SI" | "TA") => void;

  // Cart Drawer State & Actions
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;

  // Favorites Drawer State & Actions
  favorites: FavoriteItem[];
  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  clearFavorites: () => void;

  // Cross-Drawer Movements
  moveCartToFavorites: (cartItemId: string) => void;
  moveFavoriteToCart: (favoriteId: string) => void;

  // Legacy Watchlist IDs Support
  watchlist: string[];
  toggleWatchlist: (auctionId: string) => void;
  removeFromWatchlist: (auctionId: string) => void;

  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Notifications
  notifications: string[];
  addNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [language, setLanguage] = useState<"EN" | "SI" | "TA">("EN");

  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  const [watchlist, setWatchlist] = useState<string[]>(["auc_rolex_submariner", "auc_iphone15pro", "auc_ceylon_sapphire"]);
  const [notifications, setNotifications] = useState<string[]>([
    "🔔 Welcome to BIDME — Sri Lanka's Modern Online Auction Marketplace.",
    "🏆 You are leading the bid on Rolex Submariner Date 41mm!",
    "⚠️ Outbid alert: A new bid of Rs. 220,000 was placed on iPhone 15 Pro!",
  ]);

  const [preferredDashboard, setPreferredDashboardState] = useState<"BUYER" | "SELLER">("BUYER");
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem("bidme_theme") || localStorage.getItem("bitme_theme")) as "light" | "dark" | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      }

      const savedUser = localStorage.getItem("bidme_user") || localStorage.getItem("bitme_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedPref = localStorage.getItem("bidme_preferred_dashboard") || localStorage.getItem("bitme_preferred_dashboard");
      if (savedPref === "BUYER" || savedPref === "SELLER") {
        setPreferredDashboardState(savedPref);
      }

      const savedCart = localStorage.getItem("bidme_cart") || localStorage.getItem("bitme_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedFavs = localStorage.getItem("bidme_favorites") || localStorage.getItem("bitme_favorites");
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        setFavorites(parsed);
        setWatchlist(parsed.map((f: FavoriteItem) => f.id));
      }
    } catch (e) {
      // Ignore during SSR
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("bidme_theme", newTheme);
      localStorage.setItem("bitme_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const setPreferredDashboard = (mode: "BUYER" | "SELLER") => {
    setPreferredDashboardState(mode);
    try {
      localStorage.setItem("bidme_preferred_dashboard", mode);
      localStorage.setItem("bitme_preferred_dashboard", mode);
    } catch (e) {}
  };

  const updateUserProfile = (details: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...details };
      try {
        localStorage.setItem("bidme_user", JSON.stringify(updated));
        localStorage.setItem("bitme_user", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addNotification("Account profile updated successfully.");
  };

  const submitSellerApplication = (data: {
    storeName: string;
    storeDescription: string;
    bankName: string;
    bankAccount: string;
    nic: string;
  }) => {
    setCurrentUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        nic: data.nic,
        role: "BUYER_AND_SELLER",
        sellerStatus: "APPROVED",
        reputationScore: 5.0,
      };
      try {
        localStorage.setItem("bidme_user", JSON.stringify(updated));
        localStorage.setItem("bitme_user", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addNotification(`🎉 Congratulations! Your seller account "${data.storeName}" has been approved!`);
  };

  // Save changes to localStorage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    try {
      localStorage.setItem("bidme_cart", JSON.stringify(updatedCart));
      localStorage.setItem("bitme_cart", JSON.stringify(updatedCart));
    } catch (e) {}
  };

  const saveFavoritesToStorage = (updatedFavs: FavoriteItem[]) => {
    setFavorites(updatedFavs);
    setWatchlist(updatedFavs.map((f) => f.id));
    try {
      localStorage.setItem("bidme_favorites", JSON.stringify(updatedFavs));
      localStorage.setItem("bitme_favorites", JSON.stringify(updatedFavs));
    } catch (e) {}
  };

  const registerUser = (details: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...currentUser,
      ...details,
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      role: "BUYER_AND_SELLER",
      buyerScore: 100,
      reputationScore: 5.0,
      avatarUrl:
        details.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem("bidme_user", JSON.stringify(updated));
      localStorage.setItem("bitme_user", JSON.stringify(updated));
    } catch (e) {}
  };

  // Cart operations
  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [{ ...item, quantity }, ...prev];
      }
      try {
        localStorage.setItem("bidme_cart", JSON.stringify(updated));
        localStorage.setItem("bitme_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addNotification(`Added "${item.title}" to your cart.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem("bidme_cart", JSON.stringify(updated));
        localStorage.setItem("bitme_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];

      try {
        localStorage.setItem("bidme_cart", JSON.stringify(updated));
        localStorage.setItem("bitme_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearCart = () => {
    saveCartToStorage([]);
    addNotification("Cart cleared.");
  };

  // Favorites operations
  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      const updated = [item, ...prev];
      saveFavoritesToStorage(updated);
      return updated;
    });
    addNotification(`Saved "${item.title}" to your Favorites.`);
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFavoritesToStorage(updated);
      return updated;
    });
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (favorites.some((f) => f.id === item.id)) {
      removeFromFavorites(item.id);
      addNotification(`Removed "${item.title}" from Favorites.`);
    } else {
      addToFavorites(item);
    }
  };

  const clearFavorites = () => {
    saveFavoritesToStorage([]);
    addNotification("Favorites cleared.");
  };

  // Move between Cart and Favorites
  const moveCartToFavorites = (cartItemId: string) => {
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) return;

    removeFromCart(cartItemId);
    addToFavorites({
      id: item.id,
      title: item.title,
      sellerName: item.sellerName,
      currentPrice: item.price,
      startingPrice: item.price,
      imageUrl: item.imageUrl,
      endsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: "LIVE",
      totalBids: 0,
      isDirectPurchase: true,
      buyNowPrice: item.price,
      locationDistrict: item.locationDistrict,
    });
    addNotification(`Moved "${item.title}" to Favorites.`);
  };

  const moveFavoriteToCart = (favoriteId: string) => {
    const fav = favorites.find((f) => f.id === favoriteId);
    if (!fav) return;

    removeFromFavorites(favoriteId);
    addToCart({
      id: fav.id,
      title: fav.title,
      sellerName: fav.sellerName,
      condition: "Authentic Checked",
      price: fav.buyNowPrice || fav.currentPrice,
      imageUrl: fav.imageUrl,
      deliveryFee: 1200,
      locationDistrict: fav.locationDistrict,
    });
  };

  // Watchlist compatibility helpers
  const toggleWatchlist = (auctionId: string) => {
    setWatchlist((prev) => {
      const exists = prev.includes(auctionId);
      const updated = exists ? prev.filter((id) => id !== auctionId) : [...prev, auctionId];
      if (exists) {
        removeFromFavorites(auctionId);
      } else {
        addToFavorites({
          id: auctionId,
          title: "Auction Lot",
          sellerName: "Verified Consignor",
          currentPrice: 100000,
          startingPrice: 100000,
          imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
          endsAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
          status: "LIVE",
          totalBids: 1,
        });
      }
      return updated;
    });
  };

  const removeFromWatchlist = (auctionId: string) => {
    removeFromFavorites(auctionId);
  };

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        registerUser,
        updateUserProfile,
        submitSellerApplication,
        preferredDashboard,
        setPreferredDashboard,
        language,
        setLanguage,

        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        favorites,
        isFavoritesOpen,
        setIsFavoritesOpen,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        clearFavorites,

        moveCartToFavorites,
        moveFavoriteToCart,

        watchlist,
        toggleWatchlist,
        removeFromWatchlist,

        theme,
        setTheme,
        toggleTheme,

        notifications,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
