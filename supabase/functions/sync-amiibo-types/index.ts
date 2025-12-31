import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Type mapping based on AmiiboAPI documentation
const TYPE_MAP: { [key: string]: string } = {
  "00": "Figure",
  "01": "Card",
  "02": "Yarn",
  "03": "Band",
  "04": "Block"
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting amiibo type sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all amiibos from database
    const { data: dbAmiibos, error: fetchError } = await supabase
      .from('amiibos')
      .select('id, name, amiibo_hex_id, type');

    if (fetchError) throw new Error(fetchError.message);
    console.log(`Found ${dbAmiibos?.length || 0} amiibos in database`);

    let updatedCount = 0;
    const updates: string[] = [];

    for (const dbAmiibo of dbAmiibos || []) {
      const hexId = dbAmiibo.amiibo_hex_id?.toLowerCase().replace('0x', '') || '';
      
      if (hexId.length >= 16) {
        // Based on AmiiboAPI structure: hex = head (8 chars) + tail (8 chars)
        // Type is encoded in characters 6-7 of the HEAD (byte 4)
        // Example: 0x00000000 00000002 -> type at position 6-7 of head = "00" = Figure
        const typeByte = hexId.substring(6, 8);
        const newType = TYPE_MAP[typeByte];
        
        if (newType && newType !== dbAmiibo.type) {
          await supabase.from('amiibos').update({ type: newType }).eq('id', dbAmiibo.id);
          updatedCount++;
          if (updates.length < 10) {
            updates.push(`${dbAmiibo.name}: ${dbAmiibo.type} -> ${newType} (byte: ${typeByte})`);
          }
        }
      }
    }

    console.log(`Updated ${updatedCount} amiibos`);
    updates.forEach(u => console.log(u));

    return new Response(JSON.stringify({ 
      success: true, 
      updated: updatedCount,
      total: dbAmiibos?.length || 0,
      samples: updates 
    }), {
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