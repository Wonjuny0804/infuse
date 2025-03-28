"use client";

export type EmailAccount = {
  id: string;
  name: string;
  email: string;
  provider: string;
  unreadCount?: number;
};

export default function EmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-lg">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
