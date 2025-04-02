import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email Assistant Agent URL - configurable per environment
const AGENT_BASE_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

/**
 * GET endpoint to retrieve conversation history for a thread
 */
export async function GET(req: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get threadId from URL params
    const url = new URL(req.url);
    const threadId = url.searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }

    try {
      // Call the agent's history endpoint
      const response = await fetch(
        `${AGENT_BASE_URL}/conversation/history/${threadId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Id": user.id, // Pass user context to the agent
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: "Thread not found" },
            { status: 404 }
          );
        }
        throw new Error(`Agent API error: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({
        threadId,
        history: data.history,
      });
    } catch (agentError) {
      console.error("Agent API error:", agentError);
      return NextResponse.json(
        { error: "Failed to retrieve conversation history" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in assistant history API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to send a message and get a response
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request
    const { message, threadId } = await req.json();

    if (!message && !threadId) {
      return NextResponse.json(
        { error: "Message or threadId is required" },
        { status: 400 }
      );
    }

    try {
      // Prepare the request to the agent
      const endpoint = threadId
        ? `${AGENT_BASE_URL}/conversation/${threadId}`
        : `${AGENT_BASE_URL}/conversation`;

      // Send message to the agent
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          user_id: user.id, // Move user_id to request body
        }),
      });

      if (!response.ok) {
        let errorMessage = "An error occurred while processing your request.";

        switch (response.status) {
          case 404:
            errorMessage = "The conversation thread was not found.";
            break;
          case 422:
            errorMessage =
              "The message could not be processed. Please try rephrasing your request.";
            break;
          case 500:
            errorMessage =
              "The agent is currently experiencing issues. Please try again later.";
            break;
        }

        console.error(`Agent API error: ${response.statusText}`);
        return NextResponse.json(
          {
            message: errorMessage,
            error: true,
            timestamp: new Date().toISOString(),
          },
          { status: response.status === 404 ? 404 : 200 }
        ); // Only pass through 404, treat others as 200 for UI
      }

      const data = await response.json();

      // Get the latest assistant message from the messages array
      const latestMessage = data.messages[data.messages.length - 1];

      // Format the response to match our existing API structure
      const apiResponse = {
        message: latestMessage.content,
        role: latestMessage.role,
        current_action: data.current_action,
        email_state: data.email_state,
        messages: data.messages,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(apiResponse);
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json(
        {
          message: "An error occurred while processing your request.",
          error: true,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in assistant API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
