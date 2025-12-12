import { db } from "./firebase"
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore"

const PRODUCTS_COLLECTION = "products"

/**
 * Get all products from Firestore
 */
export async function getAllProducts() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    
    const products = []
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return {
      success: true,
      products
    }
  } catch (error) {
    console.error("Error getting products:", error)
    return {
      success: false,
      error: error.message,
      products: []
    }
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      return {
        success: true,
        product: {
          id: productSnap.id,
          ...productSnap.data()
        }
      }
    } else {
      return {
        success: false,
        error: "Product not found"
      }
    }
  } catch (error) {
    console.error("Error getting product:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Add a new product
 */
export async function addProduct(productData) {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    
    const newProduct = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(productsRef, newProduct)
    
    return {
      success: true,
      productId: docRef.id,
      message: "Product added successfully"
    }
  } catch (error) {
    console.error("Error adding product:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Update a product
 */
export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(productRef, updateData)
    
    return {
      success: true,
      message: "Product updated successfully"
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Update product price
 */
export async function updateProductPrice(productId, newPrice) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    
    await updateDoc(productRef, {
      price: parseFloat(newPrice),
      updatedAt: serverTimestamp()
    })
    
    return {
      success: true,
      message: "Product price updated successfully"
    }
  } catch (error) {
    console.error("Error updating product price:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    await deleteDoc(productRef)
    
    return {
      success: true,
      message: "Product deleted successfully"
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    return {
      success: false,
      error: error.message
    }
  }
}
