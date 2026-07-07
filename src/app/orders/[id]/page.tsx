
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

type Order = {
  id: string;
  buyer_email: string | null;
  receiver_first_name: string | null;
  receiver_last_name: string | null;
  subtotal_cents: number;
  payment_status: string | null;
  status: string | null;
  address_line1: string | null;
  city: string | null;
  // user_id?: string; // quando existir na BD
};

export default async function OrderPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  // Se quiser proteger com sessão:
  // const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    // .eq("user_id", user?.id) // quando tiver a coluna user_id
    .maybeSingle<Order>();

  if (error) {
    // Em dev, loga o erro
    console.error("orders select error:", error);
  }

  // Fallback quando não há dados na BD
  if (!order) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] items-center justify-center">
        <div className="shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px] px-8 md:px-20 py-10 md:py-16 max-w-2xl w-full">
          <h1 className="text-xl">Order Details</h1>
          <div className="mt-12 text-gray-600">
            Nenhuma encomenda encontrada para o ID <strong>{params.id}</strong>.
          </div>
          <div className="mt-6">
            <Link href="/profile">
            Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const price = (order.subtotal_cents / 100).toFixed(2);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] items-center justify-center">
      <div className="shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px] px-8 md:px-20 py-10 md:py-16 max-w-2xl w-full">
        <h1 className="text-xl">Order Details</h1>

        <div className="mt-12 flex flex-col gap-6">
          <div>
            <span className="font-medium">Order Id: </span>
            <span>{order.id}</span>
          </div>

          <div>
            <span className="font-medium">Receiver Name: </span>
            <span>
              {(order.receiver_first_name ?? "") + " "}
              {order.receiver_last_name ?? ""}
            </span>
          </div>

          <div>
            <span className="font-medium">Receiver Email: </span>
            <span>{order.buyer_email ?? "-"}</span>
          </div>

          <div>
            <span className="font-medium">Price: </span>
            <span>€{price}</span>
          </div>

          <div>
            <span className="font-medium">Payment Status: </span>
            <span>{order.payment_status ?? "-"}</span>
          </div>

          <div>
            <span className="font-medium">Order Status: </span>
            <span>{order.status ?? "-"}</span>
          </div>

          <div>
            <span className="font-medium">Delivery Address: </span>
            <span>
              {(order.address_line1 ?? "") + " "}
              {order.city ?? ""}
            </span>
          </div>
        </div>
      </div>

      <Link href="/contact">
      Have a problem? Contact us
      </Link>
        
      
    </div>
  );
}
