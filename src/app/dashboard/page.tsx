import { ReloadIcon, ClipboardIcon, ImageIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const suggestions = [
  {
    title: "Write a to-do list for a personal project or task",
    icon: "👤",
  },
  {
    title: "Generate an email to reply to a job offer",
    icon: "📧",
  },
  {
    title: "Summarise this article or text for me in one paragraph",
    icon: "📝",
  },
  {
    title: "How does AI work in a technical capacity",
    icon: "🤖",
  },
];

export default async function DashboardPage() {
  // this is a server component so we can fetch user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.user_metadata.full_name || user?.email;

  if (!user) {
    redirect("/");
  }

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center">
      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto ">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Hi there, {displayName}
            </h1>
            <h2 className="text-3xl font-display text-gray-600">
              What would you like to know?
            </h2>
            <p className="text-sm text-gray-500">
              Use one of the most common prompts below or use your own to begin
            </p>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <button
                type="button"
                key={index}
                className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-left"
              >
                <span className="text-2xl">{suggestion.icon}</span>
                <span className="text-gray-700 font-medium">
                  {suggestion.title}
                </span>
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <textarea
                placeholder="Ask whatever you want...."
                className="w-full min-h-[100px] px-4 py-3 bg-transparent border-0 resize-none focus:ring-0 text-gray-700 placeholder:text-gray-400"
              />
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">0/1000</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <ReloadIcon className="w-5 h-5" />
                  </Button>
                  <Button className="bg-brand-dark text-white hover:bg-brand-dark/90">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Web Search Toggle */}
          <div className="flex justify-end items-center gap-2">
            <span className="text-sm text-gray-600">All Web</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              ▼
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
