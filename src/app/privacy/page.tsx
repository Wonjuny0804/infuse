import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-500 mb-6">Last updated: May 2024</p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              At Infuse AI Labs (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;), we value your privacy and are committed to
              protecting your personal information. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you use our website and services, including our AI-powered email
              assistant (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing or using our Services, you consent to the practices
              described in this Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              2. Information We Collect
            </h2>
            <p>
              <strong>Personal Information.</strong> We may collect personal
              information that you provide directly to us when you register for
              an account, use our Services, or communicate with us, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Name and contact information (e.g., email address)</li>
              <li>Account login credentials</li>
              <li>
                Payment information (processed through secure third-party
                payment processors)
              </li>
            </ul>

            <p>
              <strong>Email Data.</strong> To provide our Services, we may
              access and process your email data, including email content,
              sender information, recipient information, and metadata. This data
              is used to generate summaries, organize your inbox, and provide
              other features of our Services.
            </p>

            <p>
              <strong>Usage Information.</strong> We automatically collect
              certain information about how you access and use our Services,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>
                Log and device information (e.g., IP address, browser type,
                device identifiers)
              </li>
              <li>Usage patterns and interactions with our Services</li>
              <li>Performance data and error reports</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Provide, maintain, and improve our Services</li>
              <li>Process and complete transactions</li>
              <li>
                Send you technical notices, updates, security alerts, and
                support messages
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Develop new products and services</li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our Services
              </li>
              <li>
                Detect, prevent, and address fraud, security breaches, and
                technical issues
              </li>
              <li>Personalize and improve your experience with our Services</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              4. How We Share Your Information
            </h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>
                <strong>Service Providers.</strong> We may share your
                information with third-party vendors, service providers,
                contractors, or agents who perform services on our behalf.
              </li>
              <li>
                <strong>Business Transfers.</strong> If we are involved in a
                merger, acquisition, financing, or sale of assets, your
                information may be transferred as part of that transaction.
              </li>
              <li>
                <strong>Legal Requirements.</strong> We may disclose your
                information if required to do so by law or in response to valid
                requests by public authorities.
              </li>
              <li>
                <strong>With Your Consent.</strong> We may share your
                information with your consent or at your direction.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect the information we collect and store. However, no method
              of transmission over the Internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              6. Data Retention
            </h2>
            <p>
              We retain your information for as long as necessary to provide our
              Services and fulfill the purposes outlined in this Privacy Policy,
              unless a longer retention period is required or permitted by law.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              7. Your Rights and Choices
            </h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>
                Accessing, correcting, or deleting your personal information
              </li>
              <li>
                Withdrawing your consent to our processing of your information
              </li>
              <li>Requesting a copy of your personal information</li>
              <li>
                Objecting to or restricting the processing of your personal
                information
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              provided in the &ldquo;Contact Us&rdquo; section below.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              8. Third-Party Services
            </h2>
            <p>
              Our Services may contain links to third-party websites and
              services. We are not responsible for the privacy practices or the
              content of these third-party sites. We encourage you to review the
              privacy policies of any third-party sites you visit.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our Services are not directed to children under the age of 13, and
              we do not knowingly collect personal information from children
              under 13. If you believe we have collected personal information
              from a child under 13, please contact us.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              material changes, we will notify you through our Services or by
              other means, such as email.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at privacy@infuseailabs.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
