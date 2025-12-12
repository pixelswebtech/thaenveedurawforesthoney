import { db } from './firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore'

// Create a new order
export async function createOrder(userId, orderData) {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingAddress: orderData.shippingAddress,
      status: 'placed', // 'placed', 'dispatched', 'delivered'
      paymentId: orderData.paymentId || null,
      paymentStatus: orderData.paymentStatus || 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return { success: true, orderId: orderRef.id }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: error.message }
  }
}

// Get orders for a specific user
export async function getUserOrders(userId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const orders = []
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })
    })
    return { success: true, orders }
  } catch (error) {
    console.error('Error getting user orders:', error)
    return { success: false, error: error.message, orders: [] }
  }
}

// Get all orders (for admin)
export async function getAllOrders(startDate = null, endDate = null) {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    
    if (startDate && endDate) {
      q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    const orders = []
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })
    })
    return { success: true, orders }
  } catch (error) {
    console.error('Error getting all orders:', error)
    return { success: false, error: error.message, orders: [] }
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: error.message }
  }
}

// Get all customers (unique users who have placed orders)
export async function getAllCustomers() {
  try {
    const ordersSnapshot = await getDocs(collection(db, 'orders'))
    const customerMap = new Map()
    
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data()
      const userId = order.userId
      
      if (!customerMap.has(userId)) {
        // Try to get user details
        const userDoc = await getDoc(doc(db, 'users', userId))
        const userData = userDoc.exists() ? userDoc.data() : {}
        
        customerMap.set(userId, {
          userId,
          email: userData.email || order.shippingAddress?.email || 'N/A',
          name: order.shippingAddress?.fullName || userData.displayName || 'N/A',
          phone: order.shippingAddress?.phone || userData.phone || 'N/A',
          totalOrders: 1,
          lastOrderDate: order.createdAt?.toDate()
        })
      } else {
        const customer = customerMap.get(userId)
        customer.totalOrders++
        const orderDate = order.createdAt?.toDate()
        if (orderDate > customer.lastOrderDate) {
          customer.lastOrderDate = orderDate
        }
      }
    }
    
    return { success: true, customers: Array.from(customerMap.values()) }
  } catch (error) {
    console.error('Error getting customers:', error)
    return { success: false, error: error.message, customers: [] }
  }
}

// Save user profile
export async function saveUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    })
    return { success: true }
  } catch (error) {
    console.error('Error saving user profile:', error)
    return { success: false, error: error.message }
  }
}

// Get monthly sales data
export async function getMonthlySalesData(year = new Date().getFullYear()) {
  try {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)
    
    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const monthlySales = Array(12).fill(0)
    
    querySnapshot.forEach((doc) => {
      const order = doc.data()
      const month = order.createdAt?.toDate().getMonth()
      monthlySales[month] += order.subtotal || 0
    })
    
    return { success: true, monthlySales }
  } catch (error) {
    console.error('Error getting monthly sales:', error)
    return { success: false, error: error.message, monthlySales: [] }
  }
}
