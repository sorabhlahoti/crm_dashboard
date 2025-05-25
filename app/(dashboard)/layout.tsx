"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { useAuth } from '@/app/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      })
      router.push('/login')
    }
  }, [user, isLoading, router, toast])
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated, don't render the dashboard
  if (!user) {
    return null
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-64 md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}