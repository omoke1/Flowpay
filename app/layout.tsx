import type { Metadata } from "next";
import "./globals.css";
import { FlowProvider } from "@/components/providers/flow-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";

export const metadata: Metadata = {
  title: "FlowPay - Business Payments on Flow",
  description: "Accept payments on Flow in seconds. Create links, get paid in crypto, automate your revenue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <FlowProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FlowProvider>
      </body>
    </html>
  );
}

