import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect the root route to the dashboard
  redirect('/login')
}