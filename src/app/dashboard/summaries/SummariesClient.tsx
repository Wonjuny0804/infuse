"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState } from "react";
import useSummaries from "@/hooks/useSummaries";
import useSummaryMutation from "@/hooks/useSummaryMutation";
import useUser from "@/hooks/useUser";
import SummaryDialog from "@/app/components/SummaryDialog";
import createClient from "@/lib/supabase/client";

export default function SummariesClient() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);

  const { data: summaries, isLoading, error } = useSummaries();
  const { mutate: markAsListened } = useSummaryMutation();
  const userData = useUser();

  // TODO: There should be a better way to handle this.
  if (!userData) {
    return <div>Loading your summaries...</div>;
  }

  const handlePlayAudio = async (summaryId: string, audioUrl: string) => {
    if (currentlyPlaying === summaryId) {
      setCurrentlyPlaying(null);
      return;
    }

    try {
      // Get the file path from the URL
      const filePath = audioUrl.split("/").pop();
      if (!filePath) {
        throw new Error("Invalid audio URL");
      }

      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("data")
        .download(`email_summaries/${filePath}`); // Try download instead of createSignedUrl

      if (error) {
        console.error("Storage error details:", error); // Detailed error logging
        return;
      }

      // Create blob URL from the downloaded file
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setCurrentlyPlaying(summaryId);
      const audio = new Audio(url);

      audio.onended = async () => {
        setCurrentlyPlaying(null);
        URL.revokeObjectURL(url); // Clean up the blob URL
        try {
          await markAsListened({ userId: userData.id, summaryId });
        } catch (error) {
          console.error("Failed to mark summary as listened:", error);
        }
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setCurrentlyPlaying(null);
    }
  };

  const formatSummaryDate = (dateString: string) => {
    const date = new Date(dateString);

    // Format as MM-DD-YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year} last night's summary`;
  };

  if (isLoading) {
    return <div className="p-4">Loading summaries...</div>;
  }

  if (error) {
    return <div className="p-4">Error loading summaries</div>;
  }

  if (!summaries || summaries?.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900">
          No summaries found
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          You don&apos;t have any email summaries yet.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Summaries</h1>
      <div className="grid gap-6 grid-cols-5">
        {summaries?.map((summary) => (
          <div
            key={summary.id}
            className={`bg-white rounded-lg shadow-md p-6 space-y-4 
              cursor-pointer hover:translate-y-[-2px]
              transition-all duration-100`}
            onClick={() => {
              setSelectedSummary(summary.summary);
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {formatSummaryDate(summary.created_at)}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePlayAudio(summary.id, summary.audio_url);
                  }}
                >
                  {currentlyPlaying === summary.id ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {currentlyPlaying === summary.id ? "Stop" : "Play"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedSummary && (
        <SummaryDialog
          open={!!selectedSummary}
          onOpenChange={() => setSelectedSummary(null)}
          summary={selectedSummary}
        />
      )}
    </div>
  );
}
