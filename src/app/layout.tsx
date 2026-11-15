import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { Toaster } from "@/shared/ui/sonner"
import "./globals.css"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    template: "%s · Sistema de préstamos",
    default: "Sistema de préstamos",
  },
  description: "Control de préstamos, cobros y caja para prestamistas.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
