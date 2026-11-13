import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-thai/thai-400.css";
import "@fontsource/noto-sans-thai/thai-600.css";
import "@fontsource/noto-sans-thai/thai-700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "HypeCheck AI — Think Before You Invest",
  description: "ห้องวิเคราะห์โพสต์การลงทุนและจำลองความเสี่ยงสำหรับการเรียนรู้",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
