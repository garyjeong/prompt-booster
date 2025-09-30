import theme from "@/theme";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Booster - AI 프롬프트 개선 도구",
  description: "AI 코딩 도우미를 위한 프롬프트 개선 도구. Claude, ChatGPT 등 LLM의 효율을 높이는 프롬프트 최적화 서비스",
  keywords: ["프롬프트", "AI", "ChatGPT", "Claude", "프롬프트 개선", "프롬프트 최적화"],
  authors: [{ name: "Gary" }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Prompt Booster - AI 프롬프트 개선 도구",
    description: "AI 코딩 도우미를 위한 프롬프트 개선 도구",
    url: "https://booster.garyzone.pro",
    siteName: "Prompt Booster",
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ColorModeScript initialColorMode="system" />
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
