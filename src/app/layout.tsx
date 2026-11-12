import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const dynamic = "force-dynamic"

const fixel = localFont({
  src: [
    { path: "./fonts/FixelText-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FixelText-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/FixelText-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/FixelText-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fixel",
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: { default: "Auto CRM", template: "%s · Auto CRM" },
  description: "AI-assisted CRM for small and medium teams",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fixel.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
