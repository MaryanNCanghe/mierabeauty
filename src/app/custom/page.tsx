import { supabaseAdmin } from "@/lib/supabase/admin";
import CustomHairBuilder from "@/components/CustomHairBuilder";

export default async function CustomPage() {
  // The placeholder product is intentionally is_active: false (hidden from public
  // browsing via RLS), so looking it up here requires the service-role client.
  const supabase = supabaseAdmin();
  const { data: placeholder } = await supabase
    .from("products")
    .select("id")
    .eq("slug", "custom-hair-build")
    .maybeSingle();

  return <CustomHairBuilder placeholderProductId={placeholder?.id ?? 0} />;
}
