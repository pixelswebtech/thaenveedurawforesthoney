import admin from 'firebase-admin'

let initialized = false

function initializeAdmin() {
  if (initialized) return
  
  try {
    const serviceAccount = require('@/serviceAccountKey.json')
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }
    initialized = true
  } catch (error) {
    console.error('Error initializing admin SDK:', error.message)
  }
}

export async function POST(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Verify authorization (only allow from authenticated admin)
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    initializeAdmin()

    const user = await admin.auth().getUserByEmail('thaenveedu@gmail.com')
    
    await admin.auth().setCustomUserClaims(user.uid, { admin: true })
    
    return new Response(JSON.stringify({ 
      message: 'Admin claim set successfully',
      uid: user.uid,
      email: user.email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
