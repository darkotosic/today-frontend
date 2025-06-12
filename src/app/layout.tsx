import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Football Predictions Today | Naksir Soccer Stats',
  description: 'Get all football predictions, live scores, league standings, player statistics and more. Powered by API-FOOTBALL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
