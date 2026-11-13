import type { Metadata } from "next";
import "./fonts.css";
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
      <head>
        {["bai-jamjuree-thai-600", "sarabun-thai-400"].map((face) => (
          <link
            key={face}
            rel="preload"
            href={`/fonts/${face}-normal.woff2`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
