import { useState } from "react";
import { EmailAccount } from "@/app/dashboard/emails/layout";

const EmailIntegrationModal = ({
  onClose,
  onAccountAdded,
}: {
  onClose: () => void;
  onAccountAdded: (account: EmailAccount) => void;
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const emailProviders = [
    { id: "gmail", name: "Gmail", icon: "📧" },
    { id: "outlook", name: "Outlook", icon: "📨" },
    { id: "yahoo", name: "Yahoo Mail", icon: "📩" },
    // Add other providers as needed
  ];

  const handleConnectEmail = async (providerId: string) => {
    setIsConnecting(true);

    try {
      // Here you would implement the actual OAuth flow or API connection
      // This is just a placeholder
      const newAccount = {
        id: Date.now().toString(),
        provider: providerId,
        email: `user@${providerId}.com`, // This would come from the OAuth response
        name: `${
          providerId.charAt(0).toUpperCase() + providerId.slice(1)
        } Account`,
      };

      // Call the callback with the new account details
      onAccountAdded(newAccount);
    } catch (error) {
      console.error("Error connecting email account:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connect an Email Account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Choose an email provider to connect your account:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {emailProviders.map((provider) => (
            <button
              key={provider.id}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
              onClick={() => handleConnectEmail(provider.id)}
              disabled={isConnecting}
            >
              <div className="text-2xl mb-2">{provider.icon}</div>
              <div className="font-medium">{provider.name}</div>
            </button>
          ))}
        </div>

        {isConnecting && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailIntegrationModal;
