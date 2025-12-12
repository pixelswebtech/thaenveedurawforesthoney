"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useUI } from "../../../components/cart-ui-context"
import { useCart } from "../../../lib/cart-store"
import { auth } from "../../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getProductById } from "../../../lib/product-service"
import { convertUnsplashUrl } from "../../../lib/image-utils"
import { getProductReviews, hasUserPurchasedProduct, hasUserReviewedProduct, addReview } from "../../../lib/review-service"
import { toast } from "sonner"

const fallbackProducts = [
  {
    id: "wildflower",
    name: "Wildflower Honey",
    description: "Floral and balanced—our most versatile classic. Perfect for everyday use.",
    fullDescription: "Our Wildflower Honey is sourced from pristine meadows where bees gather nectar from a diverse array of wildflowers. This creates a complex, balanced flavor profile that's perfect for everything from your morning toast to gourmet cooking. Each jar captures the essence of summer meadows in full bloom.\n\nThis versatile honey features delicate floral notes with a smooth, mild sweetness that won't overpower other flavors. It's ideal for tea, baking, marinades, and as a natural sweetener in your favorite recipes.",
    price: 14.0,
    imageUrl: "/Wildflowerhoney.webp",
    weight: "12 oz (340g)",
    ingredients: "100% Pure Raw Wildflower Honey",
    origin: "Local apiaries, sustainably harvested",
  },
  {
    id: "clover",
    name: "Clover Honey",
    description: "Light, bright sweetness with a gentle finish. Ideal for tea and baking.",
    fullDescription: "Our Clover Honey is a classic favorite, known for its light color and delicate, sweet flavor. Bees collect nectar from white and red clover blossoms, creating a mild honey that's beloved for its versatility.\n\nWith its subtle floral notes and smooth texture, this honey is perfect for sweetening beverages, drizzling over yogurt, or using in baked goods where you want the honey flavor to complement rather than dominate.",
    price: 12.0,
    imageUrl: "/Honey1.avif",
    weight: "12 oz (340g)",
    ingredients: "100% Pure Raw Clover Honey",
    origin: "Clover fields of the Midwest",
  },
  {
    id: "manuka",
    name: "Manuka Honey",
    description: "Rare, robust, and richly textured—sourced with care from New Zealand.",
    fullDescription: "Sourced exclusively from the remote forests of New Zealand, our Manuka Honey is harvested from bees that pollinate the native Manuka bush. This rare honey is prized worldwide for its unique properties and rich, earthy flavor.\n\nManuka honey has a distinctive taste—slightly bitter with herbaceous notes and a creamy texture. It's darker and more robust than traditional honey, making it a favorite for those who appreciate complex flavors. Known for its natural wellness properties, it's often enjoyed by the spoonful or added to warm beverages.",
    price: 28.0,
    imageUrl: "/Honey2.avif",
    weight: "8.8 oz (250g)",
    ingredients: "100% Pure Raw Manuka Honey (MGO 400+)",
    origin: "New Zealand, certified Manuka",
  },
  {
    id: "acacia",
    name: "Acacia Honey",
    description: "Delicate, clear, and slow to crystallize. Light and mild flavor.",
    fullDescription: "Acacia Honey is one of the lightest and clearest varieties of honey, sourced from the blossoms of the Black Locust tree. Its delicate flavor and unique properties make it a connoisseur's choice.\n\nThis honey remains liquid longer than most varieties due to its high fructose content. Its mild, sweet taste with subtle vanilla notes makes it perfect for those who prefer a gentler honey flavor. Excellent for sweetening without altering the taste of delicate teas and recipes.",
    price: 18.0,
    imageUrl: "/Acacia-Honey-.webp",
    weight: "12 oz (340g)",
    ingredients: "100% Pure Raw Acacia Honey",
    origin: "European acacia groves",
  },
]

const sampleReviews = {
  wildflower: [
    { name: "Sarah M.", rating: 5, date: "2025-09-15", text: "Best honey I've ever tasted! The floral notes are incredible and it's perfect in my morning tea." },
    { name: "James K.", rating: 5, date: "2025-09-10", text: "Amazing quality. You can tell this is pure, raw honey. Worth every penny!" },
    { name: "Emily R.", rating: 4, date: "2025-08-28", text: "Very good honey with a nice balance of flavors. Great for cooking and baking." },
  ],
  clover: [
    { name: "Michael B.", rating: 5, date: "2025-09-20", text: "Classic clover honey at its finest. Light, sweet, and perfect for everything." },
    { name: "Lisa T.", rating: 5, date: "2025-09-05", text: "My kids love this honey! It's mild enough for them but still full of flavor." },
    { name: "David W.", rating: 4, date: "2025-08-15", text: "Great everyday honey. I use it in my coffee every morning." },
  ],
  manuka: [
    { name: "Jennifer L.", rating: 5, date: "2025-09-25", text: "Authentic Manuka honey! The MGO rating is legit and the taste is wonderful." },
    { name: "Robert P.", rating: 5, date: "2025-09-18", text: "I've tried many Manuka brands and this is one of the best. Rich and therapeutic." },
    { name: "Amanda S.", rating: 5, date: "2025-09-01", text: "Worth the investment. The quality is outstanding and it has helped with my wellness routine." },
  ],
  acacia: [
    { name: "Patricia H.", rating: 5, date: "2025-09-22", text: "So delicate and smooth! Perfect for my herbal teas without overpowering the flavor." },
    { name: "Thomas G.", rating: 4, date: "2025-09-12", text: "Very light and sweet. Great for people who don't like strong honey flavors." },
    { name: "Maria C.", rating: 5, date: "2025-08-30", text: "Stays liquid for so long! Beautiful clear honey with a lovely taste." },
  ],
}

export default function ProductDetailContent({ productId }) {
  const router = useRouter()
  const { addItem, items } = useCart()
  const { openCart, openAuth } = useUI()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [user, setUser] = useState(null)
  const [imageUrl, setImageUrl] = useState("/placeholder.jpg")
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Try to fetch from Firestore, fallback to hardcoded data
    const fetchProduct = async () => {
      try {
        const result = await getProductById(productId)
        if (result.success && result.product) {
          // Use Firestore product data
          const firestoreProduct = result.product
          // Add default values for fields that might not be in Firestore
          setProduct({
            ...firestoreProduct,
            fullDescription: firestoreProduct.fullDescription || firestoreProduct.description,
            weight: firestoreProduct.weight || "12 oz (340g)",
            ingredients: firestoreProduct.ingredients || "100% Pure Raw Honey",
            origin: firestoreProduct.origin || "Sustainably harvested"
          })
          // Load real reviews from Firestore
          const reviewsResult = await getProductReviews(productId)
          if (reviewsResult.success) {
            setReviews(reviewsResult.reviews)
          } else {
            setReviews(sampleReviews[productId] || [])
          }
        } else {
          // Fallback to hardcoded data
          const found = fallbackProducts.find(p => p.id === productId)
          if (found) {
            setProduct(found)
            // Try to load real reviews even with fallback product
            const reviewsResult = await getProductReviews(productId)
            if (reviewsResult.success) {
              setReviews(reviewsResult.reviews)
            } else {
              setReviews(sampleReviews[productId] || [])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        // Fallback to hardcoded data on error
        const found = fallbackProducts.find(p => p.id === productId)
        if (found) {
          setProduct(found)
          // Try to load real reviews even on error
          const reviewsResult = await getProductReviews(productId)
          if (reviewsResult.success) {
            setReviews(reviewsResult.reviews)
          } else {
            setReviews(sampleReviews[productId] || [])
          }
        }
      }
    }
    
    fetchProduct()
  }, [productId])

  // Convert Unsplash URLs to direct image URLs
  useEffect(() => {
    if (product?.imageUrl) {
      const convertedUrl = convertUnsplashUrl(product.imageUrl)
      setImageUrl(convertedUrl || "/placeholder.jpg")
    } else {
      setImageUrl("/placeholder.jpg")
    }
  }, [product?.imageUrl])

  // Check if user can review this product
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (user && productId) {
        const purchased = await hasUserPurchasedProduct(user.uid, productId)
        const reviewed = await hasUserReviewedProduct(user.uid, productId)
        setCanReview(purchased && !reviewed)
        setHasReviewed(reviewed)
      } else {
        setCanReview(false)
        setHasReviewed(false)
      }
    }
    
    checkReviewEligibility()
  }, [user, productId])

  // Check if product is already in cart and show current quantity
  const existingItem = items.find(item => item.id === productId)
  const currentCartQuantity = existingItem ? existingItem.quantity : 0

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login if not authenticated
      openAuth()
      return
    }
    
    if (product) {
      addItem(product, quantity)
      openCart()
      // Reset quantity to 1 after adding
      setQuantity(1)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      openAuth()
      return
    }

    setSubmittingReview(true)
    
    const result = await addReview({
      productId: productId,
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      userEmail: user.email,
      rating: reviewForm.rating,
      reviewText: reviewForm.reviewText
    })

    if (result.success) {
      // Reload reviews
      const reviewsResult = await getProductReviews(productId)
      if (reviewsResult.success) {
        setReviews(reviewsResult.reviews)
      }
      
      // Reset form and close
      setReviewForm({ rating: 5, reviewText: "" })
      setShowReviewForm(false)
      setHasReviewed(true)
      setCanReview(false)
      
      toast.success("Thank you for your review!")
    } else {
      toast.error("Failed to submit review. Please try again.")
    }
    
    setSubmittingReview(false)
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0"

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button 
        onClick={() => router.back()} 
        className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        ← Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"
              }}
            />
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(averageRating) ? "text-yellow-500" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating} ({reviews.length} reviews)
            </span>
          </div>

          <p className="text-3xl font-bold mb-6">₹{product.price.toFixed(2)}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Weight:</span>
              <span className="text-muted-foreground">{product.weight}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Origin:</span>
              <span className="text-muted-foreground">{product.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Ingredients:</span>
              <span className="text-muted-foreground">{product.ingredients}</span>
            </div>
          </div>

          <p className="text-base text-muted-foreground mb-6">{product.description}</p>

          <div className="border-t pt-6 space-y-4">
            {currentCartQuantity > 0 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-sm">
                <p className="text-primary font-medium">
                  ✓ Already in cart: {currentCartQuantity} item{currentCartQuantity > 1 ? 's' : ''}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Adding {quantity} more will make it {currentCartQuantity + quantity} total
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center gap-2 border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted"
                >
                  −
                </button>
                <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-primary-foreground rounded-md px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              {currentCartQuantity > 0 ? 'Add More to Cart' : 'Add to Cart'} - ₹{(product.price * quantity).toFixed(2)}
            </button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> 100% Pure Raw Honey
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> No artificial additives
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Sustainably harvested
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Free shipping on orders over $50
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12 md:mt-16">
        <div className="border-b">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 font-medium transition-colors ${
                activeTab === "description" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 font-medium transition-colors ${
                activeTab === "reviews" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        <div className="py-8">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-muted-foreground">
                {product.fullDescription || product.description}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b">
                <div className="text-center">
                  <div className="text-4xl font-bold">{averageRating}</div>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(averageRating) ? "text-yellow-500" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {reviews.length} reviews
                  </div>
                </div>
                
                {/* Add Review Button */}
                {user && canReview && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                  >
                    Write a Review
                  </button>
                )}
                
                {hasReviewed && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ You've reviewed this product
                  </div>
                )}
                
                {user && !canReview && !hasReviewed && (
                  <div className="text-sm text-muted-foreground">
                    Purchase this product to leave a review
                  </div>
                )}
                
                {!user && (
                  <button
                    onClick={openAuth}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in to review
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-muted/50 rounded-lg p-6 border">
                  <h3 className="font-semibold text-lg mb-4">Write Your Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating *</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-3xl focus:outline-none transition-colors"
                          >
                            <span className={star <= reviewForm.rating ? "text-yellow-500" : "text-gray-300"}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review *</label>
                      <textarea
                        value={reviewForm.reviewText}
                        onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewForm({ rating: 5, reviewText: "" })
                        }}
                        className="border px-6 py-2 rounded-md font-medium hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, idx) => {
                    const reviewDate = review.createdAt?.toDate ? 
                      new Date(review.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
                      review.date || 'Recently'
                    
                    return (
                      <div key={review.id || idx} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {(review.userName || review.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{review.userName || review.name || 'Anonymous'}</div>
                              <div className="text-sm text-muted-foreground">{reviewDate}</div>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.reviewText || review.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
