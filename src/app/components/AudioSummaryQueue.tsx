"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createSupabaseClient from "@/lib/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Archive } from "lucide-react";
import Link from "next/link";

interface AudioSummary {
  id: string;
  user_id: string;
  email_id: string;
  summary_text: string;
  audio_url: string;
  created_at: string;
  action_state: boolean;
}

export default function AudioSummaryQueue() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: summaries, isLoading } = useQuery({
    queryKey: ["audioSummaries"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const { data: user } = await supabase.auth.getUser();

      const response = await fetch("/api/summaries/audio", {
        headers: {
          "X-User-Id": user.user?.id || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio summaries");
      }

      return response.json() as Promise<AudioSummary[]>;
    },
  });

  const markAsListened = useMutation({
    mutationFn: async () => {
      const supabase = createSupabaseClient();
      const { data: user } = await supabase.auth.getUser();

      await fetch("/api/summaries/audio", {
        method: "PATCH",
        headers: {
          "X-User-Id": user.user?.id || "",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioSummaries"] });
    },
  });

  const handlePlayAudio = (summaryId: string, audioUrl: string) => {
    setCurrentlyPlaying(summaryId);
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setCurrentlyPlaying(null);
      markAsListened.mutate();
    };
    audio.play();
  };

  if (isLoading) {
    return <div>Loading audio summaries...</div>;
  }

  if (!summaries?.length) {
    return <div>No audio summaries available</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Audio Summaries</h2>
        <Link href="/summaries/archive">
          <Button variant="outline" size="sm">
            <Archive className="w-4 h-4 mr-2" />
            View Archive
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {summaries.map((summary) => (
          <div
            key={summary.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{summary.summary_text}</p>
              <p className="text-sm text-gray-500">
                {new Date(summary.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={() => handlePlayAudio(summary.id, summary.audio_url)}
              disabled={currentlyPlaying === summary.id}
            >
              <Play className="w-4 h-4 mr-2" />
              {currentlyPlaying === summary.id ? "Playing..." : "Play"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
