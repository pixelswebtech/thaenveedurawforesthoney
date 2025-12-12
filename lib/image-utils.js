/**
 * Image Utilities for handling different image sources
 * Includes Unsplash URL conversion and validation
 */

/**
 * Convert Unsplash photo URLs to direct image URLs
 * Handles both full page URLs and direct photo URLs
 */
export function convertUnsplashUrl(url) {
  if (!url) return null

  // If it's already an unsplash api/download URL, return as is
  if (url.includes('images.unsplash.com')) {
    return url
  }

  // Extract photo ID from unsplash page URL
  // URL format: https://unsplash.com/photos/ID or https://unsplash.com/photos/ID-slug
  const match = url.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/)
  
  if (match && match[1]) {
    const photoId = match[1]
    // Return direct Unsplash image URL with quality parameters
    return `https://images.unsplash.com/photo-${photoId}?w=800&q=80&fm=jpg`
  }

  // If it's not an unsplash URL, return as is (for local paths, etc)
  return url
}

/**
 * Validate if URL is a valid image URL or Unsplash URL
 */
export function isValidImageUrl(url) {
  if (!url) return false
  
  // Check if it's an unsplash page URL
  if (url.includes('unsplash.com/photos/')) {
    return true
  }
  
  // Check if it's a direct image URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true
  }
  
  // Check if it's a local path
  if (url.startsWith('/')) {
    return true
  }
  
  return false
}

/**
 * Get optimized image URL with fallback
 */
export function getOptimizedImageUrl(url, fallback = "/placeholder.jpg") {
  if (!url) return fallback
  
  const convertedUrl = convertUnsplashUrl(url)
  return convertedUrl || fallback
}
