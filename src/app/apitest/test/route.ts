
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  return Response.json({ data, error });

if (process.env.NODE_ENV !== 'development') {
  return new Response('Not found', { status: 404 });
}

}
