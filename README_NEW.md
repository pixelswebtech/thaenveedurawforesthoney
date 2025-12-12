# 🍯 Thaenveedu - Complete E-Commerce Platform

A modern, full-featured e-commerce platform for authentic honey products. Built with Next.js 15, Firebase, and TailwindCSS 4.

![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)
![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS-4-blue)

## ✨ Complete Feature Set

### 🛍️ Customer Features

- ✅ **Secure Authentication** - Google Sign-In & Phone OTP via Firebase
- ✅ **Product Browsing** - Responsive product catalog with detailed views
- ✅ **Shopping Cart** - Persistent cart with real-time updates
- ✅ **Order Management** - Place orders, track status, view history
- ✅ **User Profile** - Manage account info and saved addresses
- ✅ **Order Tracking** - Real-time status updates (Placed → Processing → Dispatched → Delivered)
- ✅ **Responsive Design** - Perfect on all devices

### 🔐 Admin Features

- ✅ **Admin Dashboard** - Overview of orders, revenue, and customers
- ✅ **Order Management** - View all orders, filter by date/status
- ✅ **Status Updates** - Change order status visible to customers
- ✅ **Customer List** - View all registered users with search
- ✅ **Analytics** - Monthly sales graph
- ✅ **Data Export** - CSV export for orders and customers
- ✅ **Secure Access** - Role-based access control with custom claims

### 🔒 Security Features

- ✅ **Firebase Authentication** - Industry-standard auth
- ✅ **Firestore Security Rules** - Database-level protection
- ✅ **Input Validation** - Sanitize all user inputs
- ✅ **XSS Protection** - Prevent cross-site scripting
- ✅ **CSRF Protection** - Token-based security
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Secure Admin Access** - Custom claims verification

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
pnpm (recommended) or npm
Firebase account
```

### Installation

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Configure Firebase**

   Create `.env.local` in project root:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Deploy Firestore Security Rules**

   See [FIRESTORE_RULES.md](./FIRESTORE_RULES.md) for complete instructions.

4. **Set Admin Access**

   ```bash
   # Download service account key from Firebase Console
   # Save as serviceAccountKey.json in project root

   # Grant admin privileges
   node set-admin-claim.js admin@example.com
   ```

5. **Run Development Server**

   ```bash
   pnpm dev
   ```

6. **Open Browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
├── app/
│   ├── admin/
│   │   ├── page.jsx              # Admin login
│   │   ├── dashboard/page.jsx    # Admin dashboard
│   │   ├── orders/page.jsx       # Order management
│   │   └── customers/page.jsx    # Customer list
│   ├── checkout/page.jsx         # Checkout flow
│   ├── orders/page.jsx           # User order history
│   ├── profile/page.jsx          # User profile
│   ├── shop/
│   │   ├── page.jsx              # Product catalog
│   │   └── [id]/page.jsx         # Product details
│   └── page.jsx                  # Home page
├── components/
│   ├── ui/                       # UI components
│   ├── navbar.jsx                # Navigation
│   ├── footer.jsx                # Footer
│   ├── cart-drawer.jsx           # Shopping cart
│   ├── login-modal.jsx           # Auth modal
│   └── product-card.jsx          # Product card
├── lib/
│   ├── firebase.js               # Firebase config
│   ├── cart-store.js             # Cart state
│   ├── order-service.js          # Order operations
│   └── security.js               # Security utilities
├── .env.local                    # Environment vars (create this)
├── serviceAccountKey.json        # Firebase admin (create this)
└── set-admin-claim.js            # Admin setup script
```

## 🎯 User Flows

### Customer Journey

```
1. Browse Products (/shop)
   ↓
2. View Details (/shop/[id])
   ↓
3. Add to Cart (requires auth)
   ↓
4. Checkout (/checkout)
   ↓
5. Place Order
   ↓
6. Track Order (/orders)
```

### Admin Journey

```
1. Admin Login (/admin)
   ↓
2. Dashboard (/admin/dashboard)
   ↓
3. Manage Orders (/admin/orders)
   ├─ Filter by date/status
   ├─ Update order status
   └─ Export to CSV
   ↓
4. View Customers (/admin/customers)
   └─ Search & export
```

## 🔧 Configuration

### Firebase Setup (Required)

#### 1. Create Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create project or use existing
- Enable Authentication (Google & Phone)
- Enable Firestore Database

#### 2. Get Credentials

- Project Settings → General → Your apps
- Copy config to `.env.local`

#### 3. Download Service Account Key

- Project Settings → Service Accounts
- Generate new private key
- Save as `serviceAccountKey.json`

#### 4. Deploy Security Rules

Copy rules from [FIRESTORE_RULES.md](./FIRESTORE_RULES.md) to:

- Firebase Console → Firestore → Rules
- Click Publish

## 📚 Documentation

| Document                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| [USER_GUIDE.md](./USER_GUIDE.md)                 | Complete user and admin guide   |
| [SECURITY.md](./SECURITY.md)                     | Security implementation details |
| [FIRESTORE_RULES.md](./FIRESTORE_RULES.md)       | Database security rules         |
| [ADMIN_ACCESS_GUIDE.md](./ADMIN_ACCESS_GUIDE.md) | Admin setup guide               |

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code

# Admin Management
node set-admin-claim.js email@example.com  # Grant admin access
```

### Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **Styling**: TailwindCSS 4
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Analytics**: Firebase Analytics
- **State**: Zustand (cart)
- **Language**: JavaScript/JSX

## 📊 Database Schema

### Users Collection

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  phone: string,
  addresses: Array<{
    fullName, street, city, state, postalCode, phone
  }>,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders Collection

```javascript
{
  orderId: string,
  userId: string,
  items: Array<{ id, name, price, quantity, imageUrl }>,
  subtotal: number,
  status: "Order Placed" | "Processing" | "Dispatched" | "Delivered",
  shippingAddress: Object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔒 Security Checklist

### Before Deployment

- [ ] Firestore Security Rules deployed
- [ ] Environment variables configured
- [ ] Service account key is secure
- [ ] Admin users configured
- [ ] All inputs validated
- [ ] HTTPS enforced
- [ ] Dependencies updated

### After Deployment

- [ ] Test authentication flows
- [ ] Verify admin access control
- [ ] Monitor Firebase logs
- [ ] Test order creation
- [ ] Verify cart functionality

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel dashboard:

- Settings → Environment Variables
- Add each NEXT*PUBLIC_FIREBASE*\* variable

## 🆘 Troubleshooting

### Common Issues

**"Missing or insufficient permissions"**

- Deploy Firestore Security Rules
- Ensure user is authenticated
- Check admin claim is set

**Admin access not working**

```bash
# Run admin setup script
node set-admin-claim.js your-email@example.com

# Then sign out and sign back in
```

**Cart not persisting**

- Cart uses localStorage
- Check browser settings
- Clear cache if needed

## 📈 Analytics

### Tracked Events

- Page views (Firebase Analytics)
- User authentication
- Order placement
- Admin actions

### Access Analytics

- Firebase Console → Analytics
- View user engagement
- Track conversion rates

## 🤝 Support

### Getting Help

1. Check [USER_GUIDE.md](./USER_GUIDE.md)
2. Review [SECURITY.md](./SECURITY.md)
3. Check Firebase Console logs
4. Review error messages

## 🎉 Features Summary

### ✅ Completed

- Full authentication system
- Product catalog with details
- Shopping cart functionality
- Order management (user & admin)
- User profile with saved addresses
- Admin dashboard with analytics
- Order status tracking
- Data export (CSV)
- Security implementation
- Responsive design

### 🚧 Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Email notifications
- Product search & filtering
- Wishlist functionality
- Product reviews
- Inventory management
- Shipping integration

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 23, 2025

**Built with ❤️ for authentic honey lovers**
