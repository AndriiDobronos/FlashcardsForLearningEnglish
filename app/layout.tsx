import AuthStatus from "@/components/auth-status";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: "Wordly — English flashcards", description: "Інтервальне повторення англійських слів і фраз." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body><header className="site-header"><Link href="/" className="brand">wordly<span>.</span></Link><nav><Link href="/">Прогрес</Link><Link href="/study">Навчання</Link><Link href="/sets">Набори</Link><Link href="/add-card">Додати слово</Link><AuthStatus /></nav></header><main className="page-shell">{children}</main></body></html>;
}



