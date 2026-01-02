import { useAdminAuth } from '@/lib/useAdminAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return children
}
