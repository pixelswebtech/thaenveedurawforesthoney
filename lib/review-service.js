import { db } from "./firebase"
import { 
  collection, 
  addDoc, 
  getDocs, 
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore"

const REVIEWS_COLLECTION = "reviews"

/**
 * Get all reviews for a specific product
 */
export async function getProductReviews(productId) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    const q = query(
      reviewsRef, 
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    
    const reviews = []
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      reviews
    }
  } catch (error) {
    console.error("Error getting reviews:", error)
    return {
      success: false,
      error: error.message,
      reviews: []
    }
  }
}

/**
 * Check if user has purchased a product
 */
export async function hasUserPurchasedProduct(userId, productId) {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      where("status", "==", "delivered") // Only delivered orders
    )
    const querySnapshot = await getDocs(q)
    
    let hasPurchased = false
    querySnapshot.forEach((doc) => {
      const orderData = doc.data()
      if (orderData.items && Array.isArray(orderData.items)) {
        const hasProduct = orderData.items.some(item => item.id === productId)
        if (hasProduct) {
          hasPurchased = true
        }
      }
    })
    
    return hasPurchased
  } catch (error) {
    console.error("Error checking purchase:", error)
    return false
  }
}

/**
 * Check if user has already reviewed a product
 */
export async function hasUserReviewedProduct(userId, productId) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    const q = query(
      reviewsRef,
      where("userId", "==", userId),
      where("productId", "==", productId)
    )
    const querySnapshot = await getDocs(q)
    
    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking review:", error)
    return false
  }
}

/**
 * Add a review for a product
 */
export async function addReview(reviewData) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    
    const newReview = {
      productId: reviewData.productId,
      userId: reviewData.userId,
      userName: reviewData.userName,
      userEmail: reviewData.userEmail,
      rating: parseInt(reviewData.rating),
      reviewText: reviewData.reviewText,
      createdAt: serverTimestamp()
    }
    
    const docRef = await addDoc(reviewsRef, newReview)
    
    return {
      success: true,
      reviewId: docRef.id,
      message: "Review added successfully"
    }
  } catch (error) {
    console.error("Error adding review:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Calculate average rating for a product
 */
export async function getProductRating(productId) {
  try {
    const result = await getProductReviews(productId)
    
    if (!result.success || result.reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0
      }
    }
    
    const totalRating = result.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / result.reviews.length
    
    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: result.reviews.length
    }
  } catch (error) {
    console.error("Error calculating rating:", error)
    return {
      averageRating: 0,
      totalReviews: 0
    }
  }
}
