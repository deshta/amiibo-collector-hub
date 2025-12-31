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
  game_series?: Record<string, string>;
}

// Map hex IDs to their series prefixes (first 3 chars of hex ID)
const getSeriesFromHexId = (hexId: string, seriesMap: Record<string, string>): string | null => {
  // The hex ID format is like "0x0000000000000000", we need the prefix (e.g., "0x000")
  // The series map uses prefixes like "0x338", "0x364", etc.
  const hexPrefix = hexId.substring(0, 5); // Get "0x000" from "0x0000000000000000"
  return seriesMap[hexPrefix] || null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JSON data from request body
    const requestData = await req.json();
    const amiiboJson: AmiiboJson = requestData.amiibos ? requestData : { amiibos: {} };
    const seriesMap: Record<string, string> = requestData.game_series || {};
    
    if (!amiiboJson.amiibos || Object.keys(amiiboJson.amiibos).length === 0) {
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

    // Transform data with series lookup
    const amiibos = Object.entries(amiiboJson.amiibos).map(([hexId, data]) => ({
      amiibo_hex_id: hexId,
      name: data.name,
      release_au: data.release.au || null,
      release_na: data.release.na || null,
      release_eu: data.release.eu || null,
      release_jp: data.release.jp || null,
      series: getSeriesFromHexId(hexId, seriesMap),
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
