import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { initializeData } from '@/services/dataService'

export default function Layout() {
  useEffect(() => { initializeData() }, [])
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main><Outlet /></main>
    </div>
  )
}

