import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, params } = await req.json();

    if (!query) {
      throw new Error("Query is required");
    }

    console.log("Connecting to MySQL database...");
    
    // Get MySQL connection details from environment variables
    const mysqlHost = Deno.env.get('MYSQL_HOST');
    const mysqlDatabase = Deno.env.get('MYSQL_DATABASE');
    const mysqlUser = Deno.env.get('MYSQL_USER');
    const mysqlPassword = Deno.env.get('MYSQL_PASSWORD');

    if (!mysqlHost || !mysqlDatabase || !mysqlUser || !mysqlPassword) {
      throw new Error("MySQL credentials not configured. Please set MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD secrets.");
    }

    // Create MySQL client
    const client = await new Client().connect({
      hostname: mysqlHost,
      username: mysqlUser,
      db: mysqlDatabase,
      password: mysqlPassword,
      // Default MySQL port, can be customized if needed
      port: 3306,
    });

    console.log("Connected to MySQL successfully");
    console.log("Executing query:", query);

    // Execute the query
    const result = await client.execute(query, params);

    console.log("Query executed successfully, rows:", result.rows?.length ?? 0);

    // Close connection
    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        rows: result.rows ?? [],
        affectedRows: result.affectedRows,
        lastInsertId: result.lastInsertId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error in mysql-query function:', errorMessage);
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
