/**
 * Security Configuration for Thaenveedu E-Commerce Platform
 * 
 * This file contains security measures and best practices implemented
 * across the application.
 */

export const securityConfig = {
  // Firebase Security Rules (to be implemented in Firebase Console)
  firestoreRules: `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.admin == true ||
        request.auth.token.email == 'adm.thaenveedu@gmail.com'
      );
    }
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin(); // Only admins can update orders (dispatch, etc.)
      allow delete: if isAdmin(); // Only admins can delete orders
    }
    
    // Admin collection - only admins can access
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true; // Public can view products
      allow write: if isAdmin(); // Only admins can manage products
    }
  }
}
  `,

  // Content Security Policy headers
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://www.googletagmanager.com"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:", "blob:"],
    'font-src': ["'self'", "data:"],
    'connect-src': ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.cloudfunctions.net"],
    'frame-src': ["'self'", "https://*.firebaseapp.com"],
  },

  // Rate limiting configuration (for API routes)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },

  // Input validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-()]+$/,
    postalCode: /^[\d\w\s\-]+$/,
    maxStringLength: 500,
    maxOrderItems: 50,
  },

  // Sensitive data that should never be exposed
  protectedFields: [
    'password',
    'apiKey',
    'privateKey',
    'secret',
  ],
}

// Input sanitization helper
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, securityConfig.validation.maxStringLength)
}

// Validate email
export function isValidEmail(email) {
  return securityConfig.validation.email.test(email)
}

// Validate phone
export function isValidPhone(phone) {
  return securityConfig.validation.phone.test(phone)
}

// Rate limiting for client-side (prevent spam)
export class ClientRateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  checkLimit(key) {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    
    // Filter out old requests
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    )
    
    if (recentRequests.length >= this.maxRequests) {
      return false // Rate limit exceeded
    }
    
    recentRequests.push(now)
    this.requests.set(key, recentRequests)
    return true
  }

  reset(key) {
    this.requests.delete(key)
  }
}

// XSS protection helper
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Validate order data before submission
export function validateOrderData(orderData) {
  const errors = []
  
  if (!orderData.items || orderData.items.length === 0) {
    errors.push("Order must contain at least one item")
  }
  
  if (orderData.items && orderData.items.length > securityConfig.validation.maxOrderItems) {
    errors.push(`Order cannot contain more than ${securityConfig.validation.maxOrderItems} items`)
  }
  
  if (!orderData.shippingAddress) {
    errors.push("Shipping address is required")
  } else {
    const addr = orderData.shippingAddress
    
    if (!addr.fullName || addr.fullName.length < 2) {
      errors.push("Valid full name is required")
    }
    
    if (!addr.street || addr.street.length < 5) {
      errors.push("Valid street address is required")
    }
    
    if (!addr.city || addr.city.length < 2) {
      errors.push("Valid city is required")
    }
    
    if (!addr.state || addr.state.length < 2) {
      errors.push("Valid state is required")
    }
    
    if (!addr.postalCode || !securityConfig.validation.postalCode.test(addr.postalCode)) {
      errors.push("Valid postal code is required")
    }
    
    if (!addr.phone || !isValidPhone(addr.phone)) {
      errors.push("Valid phone number is required")
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default securityConfig
