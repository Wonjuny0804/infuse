import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-500 mb-6">Last updated: May 2024</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Infuse AI Labs (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;)
              govern your access to and use of our website, products, and
              services, including our AI-powered email assistant (collectively,
              the &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              2. Using Our Services
            </h2>
            <p>
              <strong>Account Registration.</strong> To use certain features of
              the Services, you may need to register for an account. You agree
              to provide accurate, current, and complete information during the
              registration process and to update such information to keep it
              accurate, current, and complete.
            </p>
            <p>
              <strong>Email Processing.</strong> Our Services involve the
              processing of email data to provide summaries, organization, and
              other features. By using our Services, you grant us the necessary
              permissions to access and process your email data in accordance
              with our{" "}
              <Link
                href="/privacy"
                className="text-brand-light hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Privacy</h2>
            <p>
              Your privacy is important to us. Our{" "}
              <Link
                href="/privacy"
                className="text-brand-light hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              explains how we collect, use, and protect your information when
              you use our Services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              4. Service Limitations and Modifications
            </h2>
            <p>
              <strong>Beta Service.</strong> Some of our Services may be offered
              as beta or pre-release versions. These Services may contain bugs
              or errors and are provided &ldquo;as is&rdquo; without warranty of
              any kind.
            </p>
            <p>
              <strong>Service Changes.</strong> We reserve the right to modify,
              suspend, or discontinue any part of the Services at any time, with
              or without notice.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>
                Use the Services for any illegal purpose or in violation of any
                laws
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Services
              </li>
              <li>
                Attempt to gain unauthorized access to the Services or related
                systems
              </li>
              <li>
                Reproduce, duplicate, copy, sell, or resell any portion of the
                Services
              </li>
              <li>
                Use the Services to transmit any malware, viruses, or other
                harmful code
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              6. Intellectual Property
            </h2>
            <p>
              The Services and all related content, features, and functionality
              are owned by us or our licensors and are protected by copyright,
              trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              7. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              8. Limitation of Liability
            </h2>
            <p>
              IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR
              RELATED TO YOUR USE OF THE SERVICES.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. If we make
              significant changes, we will notify you through the Services or by
              other means.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              10. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at
              support@infuseailabs.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
