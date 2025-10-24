import type { Metadata } from "next";
import "./globals.css";
import { FlowProviderMainnet } from "@/components/providers/flow-provider-mainnet";
import { NotificationProvider } from "@/components/providers/notification-provider";

export const metadata: Metadata = {
  title: "FlowPay - Business Payments on Flow",
  description: "Accept payments on Flow in seconds. Create links, get paid in crypto, automate your revenue.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ]
  }
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#97F11D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FlowPay" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <FlowProviderMainnet>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FlowProviderMainnet>
      </body>
    </html>
  );
}

