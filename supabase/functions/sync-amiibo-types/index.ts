import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AmiiboAPIResponse {
  amiibo: Array<{
    name: string;
    type: string;
    head: string;
    tail: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting amiibo type sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all amiibos from the API
    console.log('Fetching amiibos from AmiiboAPI...');
    const apiResponse = await fetch('https://www.amiiboapi.com/api/amiibo/');
    
    if (!apiResponse.ok) {
      throw new Error(`AmiiboAPI returned status ${apiResponse.status}`);
    }

    const apiData: AmiiboAPIResponse = await apiResponse.json();
    console.log(`Fetched ${apiData.amiibo.length} amiibos from API`);

    // Create a map of amiibo names to their types
    const amiiboTypeMap = new Map<string, string>();
    for (const amiibo of apiData.amiibo) {
      // Store by name (lowercase for matching)
      const normalizedName = amiibo.name.toLowerCase().trim();
      amiiboTypeMap.set(normalizedName, amiibo.type);
      
      // Also create hex id from head + tail
      const hexId = `${amiibo.head}${amiibo.tail}`.toLowerCase();
      amiiboTypeMap.set(hexId, amiibo.type);
    }

    console.log(`Created type map with ${amiiboTypeMap.size} entries`);

    // Fetch all amiibos from our database
    const { data: dbAmiibos, error: fetchError } = await supabase
      .from('amiibos')
      .select('id, name, amiibo_hex_id, type');

    if (fetchError) {
      throw new Error(`Failed to fetch amiibos from database: ${fetchError.message}`);
    }

    console.log(`Found ${dbAmiibos?.length || 0} amiibos in database`);

    // Update each amiibo with the correct type
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundNames: string[] = [];

    for (const dbAmiibo of dbAmiibos || []) {
      const normalizedName = dbAmiibo.name.toLowerCase().trim();
      const hexId = dbAmiibo.amiibo_hex_id?.toLowerCase().replace('0x', '') || '';
      
      // Try to find type by hex id first, then by name
      let newType = amiiboTypeMap.get(hexId) || amiiboTypeMap.get(normalizedName);
      
      // If not found, try partial name matching
      if (!newType) {
        for (const [apiName, apiType] of amiiboTypeMap) {
          if (apiName.includes(normalizedName) || normalizedName.includes(apiName)) {
            newType = apiType;
            break;
          }
        }
      }

      if (newType && newType !== dbAmiibo.type) {
        const { error: updateError } = await supabase
          .from('amiibos')
          .update({ type: newType })
          .eq('id', dbAmiibo.id);

        if (updateError) {
          console.error(`Failed to update ${dbAmiibo.name}: ${updateError.message}`);
        } else {
          updatedCount++;
          console.log(`Updated ${dbAmiibo.name}: ${dbAmiibo.type} -> ${newType}`);
        }
      } else if (!newType) {
        notFoundCount++;
        if (notFoundNames.length < 10) {
          notFoundNames.push(dbAmiibo.name);
        }
      }
    }

    console.log(`Sync complete. Updated: ${updatedCount}, Not found: ${notFoundCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        notFound: notFoundCount,
        notFoundExamples: notFoundNames,
        total: dbAmiibos?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing amiibo types:', errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});