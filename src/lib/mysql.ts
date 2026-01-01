import { supabase } from "@/integrations/supabase/client";

interface MySQLQueryResult<T = Record<string, unknown>> {
  success: boolean;
  rows?: T[];
  affectedRows?: number;
  lastInsertId?: number;
  error?: string;
}

/**
 * Execute a MySQL query through the Edge Function
 * 
 * @param query - SQL query string (use ? for parameterized queries)
 * @param params - Optional array of parameters for parameterized queries
 * @returns Query result with rows, affectedRows, or error
 * 
 * @example
 * // SELECT query
 * const result = await mysqlQuery<User>("SELECT * FROM users WHERE id = ?", [1]);
 * if (result.success) {
 *   console.log(result.rows);
 * }
 * 
 * @example
 * // INSERT query
 * const result = await mysqlQuery(
 *   "INSERT INTO users (name, email) VALUES (?, ?)",
 *   ["John", "john@example.com"]
 * );
 * if (result.success) {
 *   console.log("Inserted ID:", result.lastInsertId);
 * }
 * 
 * @example
 * // UPDATE query
 * const result = await mysqlQuery(
 *   "UPDATE users SET name = ? WHERE id = ?",
 *   ["Jane", 1]
 * );
 * if (result.success) {
 *   console.log("Affected rows:", result.affectedRows);
 * }
 */
export async function mysqlQuery<T = Record<string, unknown>>(
  query: string,
  params?: (string | number | boolean | null)[]
): Promise<MySQLQueryResult<T>> {
  try {
    const { data, error } = await supabase.functions.invoke("mysql-query", {
      body: { query, params },
    });

    if (error) {
      console.error("MySQL query error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return data as MySQLQueryResult<T>;
  } catch (error) {
    console.error("MySQL query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Example types for your MySQL tables
 * Define your own types based on your MySQL schema
 */

// Example: User table type
// interface MySQLUser {
//   id: number;
//   name: string;
//   email: string;
//   created_at: string;
// }

// Example: Product table type
// interface MySQLProduct {
//   id: number;
//   name: string;
//   price: number;
//   stock: number;
// }

/**
 * Example usage in components:
 * 
 * import { mysqlQuery } from "@/lib/mysql";
 * 
 * // Fetch users
 * const fetchUsers = async () => {
 *   const result = await mysqlQuery<MySQLUser>("SELECT * FROM users");
 *   if (result.success && result.rows) {
 *     setUsers(result.rows);
 *   } else {
 *     console.error(result.error);
 *   }
 * };
 * 
 * // Insert a new user
 * const createUser = async (name: string, email: string) => {
 *   const result = await mysqlQuery(
 *     "INSERT INTO users (name, email) VALUES (?, ?)",
 *     [name, email]
 *   );
 *   if (result.success) {
 *     console.log("User created with ID:", result.lastInsertId);
 *   }
 * };
 */
