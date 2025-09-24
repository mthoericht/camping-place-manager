'use client'

import { useEffect, useState } from 'react'

interface StatsProps {
  totalPlaces: number
  activeBookings: number
}

export default function Stats({ totalPlaces, activeBookings }: StatsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="mt-12 bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">-</div>
            <div className="text-gray-600">Total Places</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">-</div>
            <div className="text-gray-600">Active Bookings</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{totalPlaces}</div>
          <div className="text-gray-600">Total Places</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{activeBookings}</div>
          <div className="text-gray-600">Active Bookings</div>
        </div>
      </div>
    </div>
  )
}
