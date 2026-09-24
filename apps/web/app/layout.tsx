import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'COLLEGE ERP // FEE MANAGEMENT & REGRESSION TESTING LAB',
  description:
    'Production-grade College ERP Fee Management System integrated with an Automated Regression Testing Platform demonstrating baseline pass, defect injection regression detection, and resolution lifecycle.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
