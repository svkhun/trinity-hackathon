import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "hypecheck. — Investment Claim & Risk Intelligence",
  description:
    "ตรวจสอบถ้อยคำชวนลงทุน แยกภาษาเร่งรัดออกจากหลักฐาน และจำลองความเสี่ยงอย่างรอบด้าน",
};

const preloadedFonts = [
  "plus-jakarta-sans-latin-300",
  "anuphan-thai-300",
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        {preloadedFonts.map((face) => (
          <link
            key={face}
            rel="preload"
            href={`/fonts/${face}.woff2`}
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
