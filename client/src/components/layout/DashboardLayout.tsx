import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header title={title} />
        <main className="content">{children}</main>
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  )
}
