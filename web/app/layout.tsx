import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mind Systems",
  description: "Personal Power II — daily program",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
