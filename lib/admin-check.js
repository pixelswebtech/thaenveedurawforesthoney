// Simple utility to check if an email is admin
export function isAdminEmail(email) {
  return email === 'thaenveedu@gmail.com'
}

// Check if user has admin access
export function hasAdminAccess(user) {
  return user && (
    user.email === 'thaenveedu@gmail.com' || 
    user.customClaims?.admin === true
  )
}
