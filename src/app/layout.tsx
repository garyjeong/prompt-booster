import theme from "@/theme";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
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
  title: "Prompt Booster - 프로젝트 문서 생성 챗봇",
  description: "Gemini 2.5 Flash를 활용한 단계별 질의응답형 프로젝트 문서 생성 도구. 기능 명세서, PRD, TRD를 자동으로 생성합니다.",
  keywords: ["프로젝트 문서", "문서 생성", "PRD", "TRD", "기능 명세서", "Gemini", "AI 챗봇"],
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
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ColorModeScript initialColorMode="light" />
        <ChakraProvider theme={theme}>
          <Providers>
            {children}
          </Providers>
        </ChakraProvider>
      </body>
    </html>
  );
}
