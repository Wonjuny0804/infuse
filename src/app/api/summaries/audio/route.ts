import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    // we only need to get the audio summaries that were not read by the user
    const { data: audioSummaries, error } = await supabase
      .from("email_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // return data
    return NextResponse.json(audioSummaries, { status: 200 });
  } catch (error) {
    console.error("Error getting audio summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// update the action state to true
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("email_summaries")
      .update({ action_state: true })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Audio summary updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating audio summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
