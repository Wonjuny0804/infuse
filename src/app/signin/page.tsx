import { AnimatedBackground } from "@/components/ui/animated-background";
import Link from "next/link";
import SignInForm from "./form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  // Check if user is already logged in
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative flex-1 hidden lg:block">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="text-white space-y-4">
            <h1 className="font-display text-4xl font-bold">
              Welcome back to Infuse
            </h1>
            <p className="text-lg text-gray-200 max-w-lg">
              Get back to managing your emails efficiently with AI-powered
              summaries and smart organization.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Infuse
              </h2>
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-orange hover:text-brand-orange/90"
              >
                create a new account
              </Link>
            </p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
