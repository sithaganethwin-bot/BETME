"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?mode=selling");
  }, [router]);

  return (
    <div className="py-20 text-center text-xs text-[#64748B]">
      Redirecting to Consignor Studio...
    </div>
  );
}
