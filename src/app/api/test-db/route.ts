import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test 1: Basic connection and table existence
    const { data: selectData, error: selectError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (selectError) {
      return NextResponse.json({
        success: false,
        test: "table_access",
        error: selectError.message,
        code: selectError.code,
      });
    }

    // Test 2: Try to insert a test user (this will test RLS policies)
    const testWalletAddress = "test-wallet-" + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          wallet_address: testWalletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        test: "user_insert",
        error: insertError.message,
        code: insertError.code,
        details: "This might be an RLS policy issue",
      });
    }

    // Test 3: Clean up the test user
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("wallet_address", testWalletAddress);

    return NextResponse.json({
      success: true,
      message: "Database connection and user operations successful",
      tests: {
        table_access: "✅ Working",
        user_insert: "✅ Working",
        user_delete: deleteError ? "❌ Failed" : "✅ Working",
      },
      data: {
        inserted_user_id: insertData?.id,
        delete_error: deleteError?.message,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
