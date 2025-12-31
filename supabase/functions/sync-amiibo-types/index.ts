import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AmiiboEntry {
  name: string;
  release: {
    au: string | null;
    eu: string | null;
    jp: string | null;
    na: string | null;
  };
}

interface AmiiboJsonData {
  amiibos: { [hexId: string]: AmiiboEntry };
  types: { [key: string]: string };  // Direct string mapping: "0x00" -> "Figure"
}

// Type key mapping based on hex id structure
// Format: 0xHHHHHHHHTTTTTTTT where the type is encoded in specific bytes
const TYPE_MAP: { [key: string]: string } = {
  "0x00": "Figure",
  "0x01": "Card", 
  "0x02": "Yarn",
  "0x03": "Band",
  "0x04": "Block"
};

function getTypeFromHexId(hexId: string): string {
  // The type is encoded in the 7th-8th characters of the tail (bytes 13-14 of the 16 char hex)
  // Format: 0xHHHHHHHHTTTTTTTT
  // Based on AmiiboAPI structure: head (8 chars) + tail (8 chars)
  // Type byte is at position 12-13 (0-indexed) in the full hex string after 0x
  
  const cleanHex = hexId.toLowerCase().replace('0x', '');
  if (cleanHex.length >= 16) {
    // The type byte is at position 13-14 in the tail portion (last byte before series/character bytes)
    const typeByte = cleanHex.substring(14, 16);
    
    // Type mapping based on the last 2 digits before series
    // 02 = Figure, 01 = Card, 03 = Yarn, etc - this varies
    // Let's try a different approach based on the first 2 chars of head
    const firstByte = cleanHex.substring(0, 2);
    
    // Actually the type might be in a different position
    // Let's check bytes systematically
  }
  
  return 'Figure'; // Default
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting amiibo type sync from storage...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the amiibo.json file from storage
    console.log('Downloading amiibo.json from storage bucket...');
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('json')
      .download('amiibo.json');

    if (downloadError) {
      throw new Error(`Failed to download amiibo.json: ${downloadError.message}`);
    }

    const jsonText = await fileData.text();
    const apiData: AmiiboJsonData = JSON.parse(jsonText);
    
    console.log(`Parsed JSON with keys: ${Object.keys(apiData).join(', ')}`);
    console.log(`Types available: ${JSON.stringify(apiData.types)}`);
    
    const amiibosCount = Object.keys(apiData.amiibos).length;
    console.log(`Found ${amiibosCount} amiibos in JSON file`);

    // Create type map from the types object
    // Format: "0x00": "Figure", "0x01": "Card", etc.
    const typeNameMap = new Map<string, string>();
    for (const [key, typeName] of Object.entries(apiData.types)) {
      typeNameMap.set(key, typeName);
      console.log(`Type mapping: ${key} -> ${typeName}`);
    }

    // Create a map of hex id to type by analyzing the hex structure
    const amiiboTypeMap = new Map<string, string>();
    
    for (const [hexId, amiibo] of Object.entries(apiData.amiibos)) {
      const cleanHex = hexId.toLowerCase().replace('0x', '');
      
      if (cleanHex.length >= 16) {
        // Type byte is at position 12-13 (the "02" in "0x0438000103000502")
        const typeIndicator = `0x${cleanHex.substring(12, 14)}`;
        const typeName = typeNameMap.get(typeIndicator);
        
        if (typeName) {
          amiiboTypeMap.set(hexId.toLowerCase(), typeName);
        }
      }
      
      // Also store by name for fallback matching
      const storedType = amiiboTypeMap.get(hexId.toLowerCase()) || 'Figure';
      amiiboTypeMap.set(`name:${amiibo.name.toLowerCase().trim()}`, storedType);
    }

    console.log(`Created type map with ${amiiboTypeMap.size} entries`);
    
    // Log some samples
    let sampleCount = 0;
    for (const [key, value] of amiiboTypeMap) {
      if (!key.startsWith('name:') && sampleCount < 5) {
        console.log(`Sample: ${key} -> ${value}`);
        sampleCount++;
      }
    }

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
    const updates: { id: string; name: string; oldType: string; newType: string }[] = [];

    for (const dbAmiibo of dbAmiibos || []) {
      const hexId = dbAmiibo.amiibo_hex_id?.toLowerCase() || '';
      const normalizedName = dbAmiibo.name.toLowerCase().trim();
      
      // Try to find type by hex id first, then by name
      let newType = amiiboTypeMap.get(hexId) || amiiboTypeMap.get(`name:${normalizedName}`);

      if (newType && newType !== dbAmiibo.type) {
        const { error: updateError } = await supabase
          .from('amiibos')
          .update({ type: newType })
          .eq('id', dbAmiibo.id);

        if (updateError) {
          console.error(`Failed to update ${dbAmiibo.name}: ${updateError.message}`);
        } else {
          updatedCount++;
          if (updates.length < 20) {
            updates.push({
              id: dbAmiibo.id,
              name: dbAmiibo.name,
              oldType: dbAmiibo.type || 'null',
              newType
            });
          }
        }
      } else if (!newType) {
        notFoundCount++;
        if (notFoundNames.length < 10) {
          notFoundNames.push(`${dbAmiibo.name} (${hexId})`);
        }
      }
    }

    console.log(`Sync complete. Updated: ${updatedCount}, Not found: ${notFoundCount}`);
    updates.forEach(u => console.log(`Updated ${u.name}: ${u.oldType} -> ${u.newType}`));

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        notFound: notFoundCount,
        notFoundExamples: notFoundNames,
        total: dbAmiibos?.length || 0,
        sampleUpdates: updates.slice(0, 10),
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