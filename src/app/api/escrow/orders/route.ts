import { NextResponse } from "next/server";

export interface EscrowOrder {
  id: string;
  auctionId: string;
  itemTitle: string;
  itemImage: string;
  category: string;
  buyerId: string;
  buyerName: string;
  buyerDistrict: string;
  buyerAddress: string;
  sellerId: string;
  sellerName: string;
  sellerBank: string;
  sellerAccount: string;
  hammerPrice: number;
  deliveryFee: number;
  totalPaid: number;
  platformFee: number;     // 5%
  sellerPayout: number;    // 95%
  escrowStatus: 
    | "PAYMENT_HELD_ESCROW"     // Buyer paid, locked in BIDME Trust Vault
    | "COURIER_DISPATCHED"      // Platform courier picked up & in transit
    | "DELIVERED_INSPECTING"    // Delivered to buyer, 48-hour inspection clock running
    | "INSPECTION_CONFIRMED"    // Buyer verified & released funds
    | "FUNDS_RELEASED_TO_SELLER"// Funds transferred to seller bank account
    | "DISPUTED_ESCROW_FROZEN"  // Buyer reported issue, escrow frozen
    | "REFUNDED_TO_BUYER";      // Escrow refunded back to buyer
  courierPartner: string;
  waybillNumber: string;
  paidAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  inspectionEndsAt?: string;
  releasedAt?: string;
  disputeReason?: string;
}

// In-memory persistent state across requests
let escrowOrders: EscrowOrder[] = [
  {
    id: "escrow_ord_101",
    auctionId: "auc_rolex_submariner",
    itemTitle: "Rolex Submariner Date 41mm Oystersteel (Box & 2024 Papers)",
    itemImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    category: "Luxury Watches",
    buyerId: "usr_buyer_101",
    buyerName: "Kasun Jayasuriya",
    buyerDistrict: "Colombo",
    buyerAddress: "No. 42/B, Ward Place, Colombo 07",
    sellerId: "usr_seller_301",
    sellerName: "Colombo Watch Exchange (Pvt) Ltd",
    sellerBank: "Commercial Bank of Ceylon",
    sellerAccount: "•••• 8009",
    hammerPrice: 2100000,
    deliveryFee: 0,
    totalPaid: 2100000,
    platformFee: 105000,   // 5%
    sellerPayout: 1995000, // 95%
    escrowStatus: "DELIVERED_INSPECTING",
    courierPartner: "BIDME Insured High-Value Logistics",
    waybillNumber: "BDME-COL-94812",
    paidAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    dispatchedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    inspectionEndsAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(), // 36 hours remaining
  },
  {
    id: "escrow_ord_102",
    auctionId: "auc_iphone15pro",
    itemTitle: "Apple iPhone 15 Pro Max 256GB Natural Titanium (TRCSL Approved)",
    itemImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    category: "Electronics",
    buyerId: "usr_buyer_101",
    buyerName: "Kasun Jayasuriya",
    buyerDistrict: "Colombo",
    buyerAddress: "No. 42/B, Ward Place, Colombo 07",
    sellerId: "usr_seller_302",
    sellerName: "TechZone Premium Consignments",
    sellerBank: "Sampath Bank PLC",
    sellerAccount: "•••• 3314",
    hammerPrice: 385000,
    deliveryFee: 1500,
    totalPaid: 386500,
    platformFee: 19250,
    sellerPayout: 365750,
    escrowStatus: "COURIER_DISPATCHED",
    courierPartner: "PromptX Express Courier",
    waybillNumber: "PRMX-LK-77401",
    paidAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    dispatchedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: "escrow_ord_103",
    auctionId: "auc_ceylon_sapphire",
    itemTitle: "Unheated Royal Blue Ceylon Sapphire 3.42ct (GIA Certified)",
    itemImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    category: "Ceylon Gemstones",
    buyerId: "usr_buyer_101",
    buyerName: "Kasun Jayasuriya",
    buyerDistrict: "Colombo",
    buyerAddress: "No. 42/B, Ward Place, Colombo 07",
    sellerId: "usr_seller_303",
    sellerName: "Ratnapura Gem Bureau",
    sellerBank: "Bank of Ceylon",
    sellerAccount: "•••• 9102",
    hammerPrice: 850000,
    deliveryFee: 0,
    totalPaid: 850000,
    platformFee: 42500,
    sellerPayout: 807500,
    escrowStatus: "PAYMENT_HELD_ESCROW",
    courierPartner: "BIDME Armored Vault Transit",
    waybillNumber: "AWAITING_WAYBILL",
    paidAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const role = searchParams.get("role"); // buyer | seller | admin

    if (orderId) {
      const order = escrowOrders.find((o) => o.id === orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    // Return all orders (with summary stats)
    const totalVaultBalance = escrowOrders
      .filter((o) => ["PAYMENT_HELD_ESCROW", "COURIER_DISPATCHED", "DELIVERED_INSPECTING", "DISPUTED_ESCROW_FROZEN"].includes(o.escrowStatus))
      .reduce((sum, o) => sum + o.totalPaid, 0);

    const pendingSellerPayouts = escrowOrders
      .filter((o) => ["PAYMENT_HELD_ESCROW", "COURIER_DISPATCHED", "DELIVERED_INSPECTING"].includes(o.escrowStatus))
      .reduce((sum, o) => sum + o.sellerPayout, 0);

    return NextResponse.json({
      success: true,
      orders: escrowOrders,
      metrics: {
        totalOrders: escrowOrders.length,
        totalVaultBalance,
        pendingSellerPayouts,
        activeInspections: escrowOrders.filter((o) => o.escrowStatus === "DELIVERED_INSPECTING").length,
        disputedCount: escrowOrders.filter((o) => o.escrowStatus === "DISPUTED_ESCROW_FROZEN").length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, action, reason, waybill, courier } = body;

    const orderIndex = escrowOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: "Escrow order not found" }, { status: 404 });
    }

    const order = { ...escrowOrders[orderIndex] };

    switch (action) {
      // 1. Seller dispatches package via platform courier
      case "DISPATCH_PACKAGE":
        order.escrowStatus = "COURIER_DISPATCHED";
        order.courierPartner = courier || "BIDME Express Insured Logistics";
        order.waybillNumber = waybill || `BDME-DISP-${Math.floor(10000 + Math.random() * 90000)}`;
        order.dispatchedAt = new Date().toISOString();
        break;

      // 2. Courier delivers package -> 48h Inspection Window starts!
      case "MARK_DELIVERED":
        order.escrowStatus = "DELIVERED_INSPECTING";
        order.deliveredAt = new Date().toISOString();
        // 48 hours from now
        order.inspectionEndsAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        break;

      // 3. Buyer confirms inspection & releases funds to seller!
      case "CONFIRM_INSPECTION_RELEASE":
        order.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
        order.releasedAt = new Date().toISOString();
        break;

      // 4. Buyer reports dispute -> Escrow frozen!
      case "RAISE_DISPUTE":
        order.escrowStatus = "DISPUTED_ESCROW_FROZEN";
        order.disputeReason = reason || "Item received damaged or does not match verified listing authenticity.";
        break;

      // 5. Admin arbitrates and forces release or refund
      case "ADMIN_FORCE_RELEASE":
        order.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
        order.releasedAt = new Date().toISOString();
        break;

      case "ADMIN_REFUND_BUYER":
        order.escrowStatus = "REFUNDED_TO_BUYER";
        break;

      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }

    escrowOrders[orderIndex] = order;

    return NextResponse.json({
      success: true,
      message: `Escrow order ${orderId} updated to ${order.escrowStatus}`,
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
