import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setAdmin(null)
        setLoading(false)
        return
      }

      try {
        // Check if user is admin by email
        if (user.email === 'thaenveedu@gmail.com') {
          // Also check admin collection for additional admin data
          const adminDoc = await getDoc(doc(db, 'admins', user.uid))
          
          setAdmin({
            uid: user.uid,
            email: user.email,
            role: 'super_admin',
            ...(adminDoc.exists() ? adminDoc.data() : {})
          })
        } else {
          setAdmin(null)
        }
      } catch (err) {
        setError(err.message)
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { admin, loading, error, isAdmin: !!admin }
}
