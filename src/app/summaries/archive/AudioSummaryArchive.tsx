"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AudioSummary {
  id: string;
  user_id: string;
  email_id: string;
  summary_text: string;
  audio_url: string;
  created_at: string;
  action_state: boolean;
}

export default function AudioSummaryArchive() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const { data: summaries, isLoading } = useQuery({
    queryKey: ["audioSummariesArchive"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("email_summaries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AudioSummary[];
    },
  });

  const handlePlayAudio = (summaryId: string, audioUrl: string) => {
    setCurrentlyPlaying(summaryId);
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setCurrentlyPlaying(null);
    };
    audio.play();
  };

  if (isLoading) {
    return <div>Loading archive...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-4">Audio Summary Archive</h1>
      </div>

      <div className="grid gap-4">
        {summaries?.map((summary) => (
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
