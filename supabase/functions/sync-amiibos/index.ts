import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AmiiboApiResponse {
  amiibo: Array<{
    amiiboSeries: string;
    character: string;
    gameSeries: string;
    head: string;
    image: string;
    name: string;
    release: {
      au: string | null;
      eu: string | null;
      jp: string | null;
      na: string | null;
    };
    tail: string;
    type: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all amiibos from the API
    console.log("Fetching amiibos from API...");
    const response = await fetch("https://www.amiiboapi.com/api/amiibo/");
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: AmiiboApiResponse = await response.json();
    console.log(`Fetched ${data.amiibo.length} amiibos from API`);

    // Transform data for our database
    const amiibos = data.amiibo.map((amiibo) => {
      // Get the earliest release date
      const dates = [amiibo.release.jp, amiibo.release.na, amiibo.release.eu, amiibo.release.au]
        .filter(Boolean)
        .sort();
      const releaseDate = dates.length > 0 ? dates[0] : null;

      return {
        name: amiibo.name,
        series: amiibo.amiiboSeries,
        character_name: amiibo.character,
        image_url: amiibo.image,
        release_date: releaseDate,
      };
    });

    // Clear existing amiibos and insert new ones
    console.log("Deleting existing amiibos...");
    const { error: deleteError } = await supabase
      .from("amiibos")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
      console.error("Delete error:", deleteError);
    }

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < amiibos.length; i += batchSize) {
      const batch = amiibos.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("amiibos")
        .insert(batch);

      if (insertError) {
        console.error(`Insert error at batch ${i}:`, insertError);
        throw insertError;
      }
      
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${amiibos.length} amiibos`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${amiibos.length} amiibos`,
        count: amiibos.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
