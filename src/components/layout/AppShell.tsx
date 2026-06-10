import { Sidebar } from './Sidebar'
import { BottomBar } from './BottomBar'

interface AppShellProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function AppShell({ children, isAdmin }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <main
        id="main-content"
        className="lg:pl-[240px] pb-[64px] lg:pb-0 min-h-screen"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <BottomBar />
    </div>
  )
}
