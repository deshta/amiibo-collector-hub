import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AmiiboData {
  name: string;
  release: {
    au: string | null;
    na: string | null;
    eu: string | null;
    jp: string | null;
  };
}

interface AmiiboJson {
  amiibos: Record<string, AmiiboData>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JSON data from request body
    const amiiboJson: AmiiboJson = await req.json();
    
    if (!amiiboJson.amiibos) {
      throw new Error("Invalid JSON format: missing 'amiibos' key");
    }

    // Clear existing data
    const { error: deleteError } = await supabase
      .from("amiibos")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Error deleting existing data:", deleteError);
    }

    // Transform data
    const amiibos = Object.entries(amiiboJson.amiibos).map(([hexId, data]) => ({
      amiibo_hex_id: hexId,
      name: data.name,
      release_au: data.release.au || null,
      release_na: data.release.na || null,
      release_eu: data.release.eu || null,
      release_jp: data.release.jp || null,
    }));

    console.log(`Importing ${amiibos.length} amiibos...`);

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < amiibos.length; i += batchSize) {
      const batch = amiibos.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("amiibos")
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${amiibos.length} amiibos`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${amiibos.length} amiibos` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
