# 🐝 The Thaenveedu - E-Commerce Platform

A modern, production-ready e-commerce platform for artisanal honey products. Built with Next.js 15, React 18, and Tailwind CSS 4.

![The Thaenveedu](https://images.unsplash.com/photo-1587049352846-4a222e784720?w=1200&q=80)

## ✨ Features

### 🎨 Beautiful UI/UX

- **100vh Hero Section** - Full-viewport honey drizzle background on desktop
- **Scroll-triggered animations** - Best Sellers section appears smoothly on scroll
- **Fully Responsive Design** - Optimized for mobile, tablet, mini iPhone, and desktop
- **Modern Design System** - Honey-gold color palette with professional typography

### 🛒 E-Commerce Functionality

- **Product Catalog** - 11 unique honey varieties with real product images
- **Shopping Cart** - Smooth drawer with quantity controls
- **Secure Checkout** - Razorpay payment integration
- **User Authentication** - Firebase Auth with Google Sign-In and Phone OTP

### 📱 Mobile-First Design

- **Responsive Navigation** - Mobile hamburger menu with smooth transitions
- **Touch-Optimized** - Large touch targets and mobile-friendly interactions
- **Performance Optimized** - Lazy loading images and efficient rendering

### 🎯 Key Sections

1. **Hero** - Full-screen honey drizzle with dual CTAs
2. **Best Sellers** - Featured products with scroll-reveal animation
3. **Benefits** - Three key health benefits with icons
4. **Our Story** - Brand narrative with imagery
5. **Honeycomb Facts** - Interactive hexagonal grid
6. **Testimonials** - Auto-rotating customer reviews
7. **Footer** - Comprehensive contact and social links

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd e-commerce-platform-build

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📦 Tech Stack

- **Framework:** Next.js 15.2.4
- **React:** 18.2.0
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI
- **State Management:** Zustand (cart)
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Payments:** Razorpay
- **Animations:** Tailwind Animate + CSS Transitions

## 🏗️ Project Structure

```
e-commerce-platform-build/
├── app/
│   ├── sections/
│   │   └── featured-products.jsx    # Best sellers with scroll animation
│   ├── shop/
│   │   └── page.jsx                 # Product catalog
│   ├── checkout/
│   │   └── page.jsx                 # Checkout flow
│   ├── page.jsx                     # Homepage
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── navbar.jsx                   # Responsive navigation
│   ├── hero.jsx                     # 100vh hero section
│   ├── product-card.jsx             # Product card with hover effects
│   ├── cart-drawer.jsx              # Shopping cart sidebar
│   ├── footer.jsx                   # Site footer
│   ├── benefits.jsx                 # Benefits section
│   ├── story.jsx                    # About section
│   ├── honeycomb.jsx                # Interactive facts
│   ├── testimonials.jsx             # Reviews carousel
│   ├── login-modal.jsx              # Authentication modal
│   └── ui/                          # Radix UI components
├── lib/
│   ├── cart-store.js                # Shopping cart state
│   ├── firebase.js                  # Firebase configuration
│   └── utils.ts                     # Utilities
└── public/                          # Static assets
```

## 🎨 Responsive Breakpoints

```css
/* Mobile (default) */
< 640px

/* Small devices (sm) */
≥ 640px

/* Tablets (md) */
≥ 768px

/* Laptops (lg) */
≥ 1024px

/* Desktops (xl) */
≥ 1280px
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 📱 Responsive Design Features

### Mobile (< 640px)

- Single column layouts
- Hamburger menu navigation
- Full-width buttons and forms
- Touch-optimized spacing (min 44px touch targets)
- Cart icon in navbar instead of text

### Tablet (640px - 1024px)

- Two-column product grids
- Expanded navigation menu
- Larger typography scale
- Optimized image sizing

### Desktop (≥ 1024px)

- Four-column product grids
- Full navigation menu
- 100vh hero section
- Hover effects and animations
- Maximum content width: 1280px

## 🎯 Product Images

All products now use high-quality Unsplash images:

| Product              | Image Source              |
| -------------------- | ------------------------- |
| Wildflower Honey     | Unsplash honey jars       |
| Clover Honey         | Unsplash honey collection |
| Manuka Honey         | Unsplash artisanal honey  |
| Acacia Honey         | Unsplash honey bottles    |
| Lavender Honey       | Unsplash honey varieties  |
| Eucalyptus Honey     | Unsplash honey products   |
| Orange Blossom Honey | Unsplash honey citrus     |
| Buckwheat Honey      | Unsplash dark honey       |
| Sage Honey           | Unsplash herbal honey     |
| Thyme Honey          | Unsplash Greek honey      |
| Heather Honey        | Unsplash Scottish honey   |

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build for Production

```bash
npm run build
npm run start
```

## ✅ Production Checklist

- [x] 100vh hero section on desktop
- [x] Scroll-triggered Best Sellers animation
- [x] Real product images (8 varieties)
- [x] Fully responsive design (mobile, tablet, desktop)
- [x] Mobile-optimized navigation
- [x] Cart drawer with image support
- [x] Enhanced checkout flow
- [x] Professional footer
- [x] Auto-rotating testimonials
- [x] Interactive honeycomb section
- [x] Accessibility improvements
- [x] SEO-friendly structure
- [x] Performance optimizations

## 🎨 Design System

### Colors

- **Primary (Honey Gold):** `#FFB300`
- **Background:** `#F8F4E3` (Off-white)
- **Foreground:** `#2B1A0A` (Deep brown)
- **Accent:** `#4A2B0F` (Earthy brown)
- **Secondary:** `#EDE6D2`

### Typography

- **Serif (Headings):** Lora
- **Sans (Body):** Inter
- **Font Scale:** Responsive from mobile to desktop

### Spacing

- Mobile: 4, 6, 8, 12, 16, 20px
- Desktop: 6, 8, 12, 16, 20, 24, 32px

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Product images from [Unsplash](https://unsplash.com)
- Icons from [Heroicons](https://heroicons.com)
- UI components from [Radix UI](https://www.radix-ui.com)
- Animations from [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For support, email
thaenveedu@gmail.com or visit our contact page.

---

**Built with 🍯 by The Thaenveedu Team**
