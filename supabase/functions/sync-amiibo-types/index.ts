import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting amiibo type sync from GitHub...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch amiibo data from GitHub
    const amiiboResponse = await fetch('https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/database/amiibo.json');
    const amiiboData = await amiiboResponse.json();
    
    // Fetch type mapping from GitHub
    const typeResponse = await fetch('https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/database/amiibo_type.json');
    const typeData = await typeResponse.json();
    
    // Create type map: "0x00" -> "Figure"
    const typeNameMap = new Map<string, string>();
    for (const [key, value] of Object.entries(typeData.amiibo_type)) {
      typeNameMap.set(key, (value as {key: string, name: string}).name);
    }
    console.log(`Type mappings: ${[...typeNameMap.entries()].map(([k,v]) => `${k}=${v}`).join(', ')}`);

    // Create map of hex_id to type by extracting type byte from hex
    const amiiboTypeMap = new Map<string, string>();
    for (const hexId of Object.keys(amiiboData.amiibos)) {
      const cleanHex = hexId.toLowerCase().replace('0x', '');
      // Type is at byte position 12-13 (characters 12-14 in the 16-char hex)
      const typeByte = `0x${cleanHex.substring(12, 14)}`;
      const typeName = typeNameMap.get(typeByte);
      if (typeName) {
        amiiboTypeMap.set(hexId.toLowerCase(), typeName);
      }
    }
    console.log(`Created ${amiiboTypeMap.size} type mappings`);

    // Fetch and update database
    const { data: dbAmiibos, error: fetchError } = await supabase
      .from('amiibos')
      .select('id, name, amiibo_hex_id, type');

    if (fetchError) throw new Error(fetchError.message);

    let updatedCount = 0;
    for (const dbAmiibo of dbAmiibos || []) {
      const hexId = dbAmiibo.amiibo_hex_id?.toLowerCase() || '';
      const newType = amiiboTypeMap.get(hexId);
      
      if (newType && newType !== dbAmiibo.type) {
        await supabase.from('amiibos').update({ type: newType }).eq('id', dbAmiibo.id);
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} amiibos`);
    return new Response(JSON.stringify({ success: true, updated: updatedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});