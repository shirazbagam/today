# AJKMart — Complete Project Guide
# Admin Panel | Rider App | Customer App | Vendor App
# Database | API Routes | UI/UX | File Locations

---

## Project Structure Overview

```
workspace/
├── artifacts/
│   ├── admin/          ← Admin Panel (Web - React/Vite)
│   ├── rider-app/      ← Rider App (Web - React/Vite)
│   ├── vendor-app/     ← Vendor App (Web - React/Vite)
│   ├── ajkmart/        ← Customer App (Mobile - Expo/React Native)
│   └── api-server/     ← Backend API (Node.js/Express)
├── lib/
│   ├── db/             ← Database schema & migrations
│   ├── api-client-react/ ← Shared API hooks
│   ├── auth-utils/     ← Authentication helpers
│   ├── i18n/           ← Urdu/English translations
│   ├── api-spec/       ← API type definitions
│   └── service-constants/ ← Shared constants
└── pnpm-workspace.yaml ← Monorepo config
```

---

# DATABASE

## Location
```
lib/db/
├── schema.ts           ← Poori database schema (tables)
├── migrate.ts          ← Migration runner
└── migrations/         ← SQL migration files
```

## Main Tables

| Table | Kya store hota hai |
|-------|-------------------|
| `users` | Customers — name, phone, email, password |
| `riders` | Delivery riders — status, location, wallet |
| `vendors` | Shops/vendors — name, location, balance |
| `orders` | Customer orders — items, status, rider |
| `order_items` | Order ke andar products |
| `products` | Products — name, price, images |
| `categories` | Product categories |
| `rides` | Ride bookings — pickup, drop, status |
| `wallet_transactions` | Rider/vendor payments |
| `notifications` | Push notifications |
| `banners` | Home page banners |
| `promo_codes` | Discount codes |
| `reviews` | Product reviews |
| `addresses` | User saved addresses |
| `platform_settings` | App-wide settings |
| `kyc_requests` | KYC verification |
| `sos_alerts` | Emergency alerts |
| `parcel_orders` | Parcel delivery orders |
| `van_bookings` | Van/school van bookings |

---

# API SERVER (Backend)

## Location
```
artifacts/api-server/src/
├── routes/             ← Sab API endpoints
├── services/           ← Business logic
├── middleware/         ← Auth, validation
└── lib/                ← Helper functions
```

## API Routes — Complete List

### Customer Routes (`/api/...`)
| File | Route | Kya karta hai |
|------|-------|--------------|
| `auth.ts` | `/api/auth/*` | Login, register, OTP, logout |
| `products.ts` | `/api/products` | Products list, search, flash deals |
| `categories.ts` | `/api/categories` | Categories list |
| `orders.ts` | `/api/orders` | Order place, track, cancel |
| `rides.ts` | `/api/rides` | Ride book, track, cancel |
| `payments.ts` | `/api/payments` | Payment methods, process |
| `wallet.ts` | `/api/wallet` | Wallet balance, transactions |
| `addresses.ts` | `/api/addresses` | Save/get addresses |
| `reviews.ts` | `/api/reviews` | Product reviews |
| `wishlist.ts` | `/api/wishlist` | Wishlist add/remove |
| `banners.ts` | `/api/banners` | Home page banners |
| `notifications.ts` | `/api/notifications` | Notifications list |
| `parcel.ts` | `/api/parcel` | Parcel booking |
| `pharmacy.ts` | `/api/pharmacy` | Medicine orders |
| `van.ts` | `/api/van` | Van/school van booking |
| `maps.ts` | `/api/maps` | Map search, autocomplete |
| `kyc.ts` | `/api/kyc` | KYC document upload |
| `sos.ts` | `/api/sos` | Emergency SOS |
| `platform-config.ts` | `/api/platform-config` | App settings |
| `recommendations.ts` | `/api/recommendations` | Trending products |
| `health.ts` | `/api/health` | Server health check |

### Rider Routes (`/api/rider/...`)
| File | Route | Kya karta hai |
|------|-------|--------------|
| `rider.ts` | `/api/rider/status` | Online/offline toggle |
| | `/api/rider/location` | GPS location update |
| | `/api/rider/orders` | Assigned orders |
| | `/api/rider/earnings` | Earnings stats |
| | `/api/rider/wallet` | Wallet balance |

### Vendor Routes (`/api/vendor/...`)
| File | Route | Kya karta hai |
|------|-------|--------------|
| `vendor.ts` | `/api/vendor/products` | Products manage |
| | `/api/vendor/orders` | Incoming orders |
| | `/api/vendor/analytics` | Sales analytics |
| | `/api/vendor/wallet` | Wallet |

### Admin Routes (`/api/admin/...`)
| File | Route | Kya karta hai |
|------|-------|--------------|
| `admin/auth.ts` | `/api/admin/auth` | Admin login |
| `admin/orders.ts` | `/api/admin/orders` | All orders manage |
| `admin/riders.ts` | `/api/admin/riders` | Riders manage |
| `admin/users.ts` | `/api/admin/users` | Users manage |
| `admin/finance.ts` | `/api/admin/finance` | Payments, withdrawals |
| `admin/system.ts` | `/api/admin/system` | Settings, platform config |
| `admin/locations.ts` | `/api/admin/locations` | Delivery zones |
| `admin/content.ts` | `/api/admin/content` | Banners, promos |
| `admin/pharmacy.ts` | `/api/admin/pharmacy` | Pharmacy manage |
| `admin/rides.ts` | `/api/admin/rides` | Rides manage |

### Services & Helpers
```
services/
├── sms.ts              ← OTP SMS (Twilio/MSG91)
├── email.ts            ← Email notifications
├── notification.ts     ← Push notifications
├── password.ts         ← Password hash/verify
└── whatsapp.ts         ← WhatsApp messages

lib/
├── socketio.ts         ← Real-time (Socket.io)
├── webpush.ts          ← Web push notifications
├── fees.ts             ← Delivery fee calculation
├── geofence.ts         ← Area/zone checking
└── payment-providers.ts ← Payment gateway
```

---

# ADMIN PANEL

## Location: `artifacts/admin/src/`

## Pages (Kya kahan milega)
```
pages/
├── dashboard.tsx           ← Main dashboard — stats, charts
├── orders/
│   ├── index.tsx           ← Orders list + filter
│   ├── OrderDetailDrawer.tsx ← Order detail popup
│   ├── RiderAssignPanel.tsx  ← Rider assign to order
│   ├── OrdersTable.tsx       ← Orders table
│   └── OrdersStatsCards.tsx  ← Stats cards
├── riders.tsx              ← Riders list + manage
├── users.tsx               ← Customers list
├── vendors.tsx             ← Vendors list
├── products.tsx            ← Products manage
├── categories.tsx          ← Categories manage (same page)
├── rides.tsx               ← Ride bookings
├── transactions.tsx        ← All payments/transactions
├── Withdrawals.tsx         ← Withdrawal requests
├── DepositRequests.tsx     ← Deposit requests
├── wallet.tsx              ← Wallet management
├── promo-codes.tsx         ← Discount codes
├── flash-deals.tsx         ← Flash sale deals
├── reviews.tsx             ← Customer reviews
├── notifications.tsx       ← Send notifications
├── kyc.tsx                 ← KYC verification
├── locations.tsx           ← Delivery locations
├── parcel.tsx              ← Parcel orders
├── pharmacy.tsx            ← Pharmacy orders
├── van.tsx                 ← Van bookings
├── van-boarding.tsx        ← Van boarding manage
├── live-riders-map.tsx     ← Live map of all riders
├── gps-alerts.tsx          ← GPS alerts
├── sos-alerts.tsx          ← SOS emergency alerts
├── silence-mode.tsx        ← Notification silence
├── wishlists.tsx           ← User wishlists
├── deletion-requests.tsx   ← Account deletion requests
├── delivery-access.tsx     ← Delivery zone access
├── condition-rules.tsx     ← Business condition rules
├── settings.tsx            ← General settings
├── settings-payment.tsx    ← Payment settings
├── settings-system.tsx     ← System settings
├── settings-integrations.tsx ← SMS/Email integrations
├── settings-security.tsx   ← Security settings
└── login.tsx               ← Admin login
```

## Components
```
components/
├── layout/AdminLayout.tsx  ← Sidebar + header layout
├── CommandPalette.tsx      ← Search bar (Ctrl+K)
├── ServiceZonesManager.tsx ← Delivery zones on map
├── MapPinPicker.tsx        ← Map location picker
└── ui/                     ← All UI components
```

## Kya Fix Karna Ho Toh Kahan Jayen

| Kaam | File |
|------|------|
| Dashboard stats change | `pages/dashboard.tsx` |
| Order management | `pages/orders/index.tsx` |
| Rider assign logic | `pages/orders/RiderAssignPanel.tsx` |
| Settings change | `pages/settings-system.tsx` |
| Live map | `pages/live-riders-map.tsx` |
| Payment settings | `pages/settings-payment.tsx` |
| Sidebar menu | `components/layout/AdminLayout.tsx` |
| Colors/theme | `src/index.css` |

---

# RIDER APP

## Location: `artifacts/rider-app/src/`

## Pages
```
pages/
├── Home.tsx            ← Main dashboard
│                           - Online/Offline toggle
│                           - Order requests
│                           - Ride requests
│                           - Daily stats
├── Active.tsx          ← Active delivery/ride tracking
├── Earnings.tsx        ← Daily/weekly earnings
├── History.tsx         ← Completed orders history
├── Wallet.tsx          ← Wallet balance + transactions
├── Profile.tsx         ← Profile + settings
├── Notifications.tsx   ← Notifications list
├── Login.tsx           ← Login page
├── Register.tsx        ← Register page
├── ForgotPassword.tsx  ← Password reset
├── VanDriver.tsx       ← Van driver special page
└── SecuritySettings.tsx ← Security settings
```

## Dashboard Components
```
components/dashboard/
├── OrderRequestCard.tsx    ← Delivery order popup (accept/reject)
├── RideRequestCard.tsx     ← Ride request popup (accept/reject)
├── AcceptCountdown.tsx     ← 30-second timer countdown
├── StatsGrid.tsx           ← Today's stats boxes
├── OnlineToggleCard.tsx    ← Online/Offline button
├── MiniMap.tsx             ← Small map on dashboard
├── LiveClock.tsx           ← Real-time clock
├── ActiveTaskBanner.tsx    ← Current active task banner
├── SystemWarnings.tsx      ← Warning alerts
└── RequestListHeader.tsx   ← Order requests header
```

## Core Logic
```
lib/
├── api.ts              ← All API calls
├── auth.tsx            ← Login/logout/session
├── socket.tsx          ← Real-time order/ride updates
├── gpsQueue.ts         ← GPS location send to server
├── rideUtils.ts        ← Ride helper functions
├── push.ts             ← Push notifications
└── notificationSound.ts ← Order accept sound
```

## Kya Fix Karna Ho Toh Kahan Jayen

| Kaam | File |
|------|------|
| Home redesign | `pages/Home.tsx` |
| Order accept popup | `components/dashboard/OrderRequestCard.tsx` |
| Ride accept popup | `components/dashboard/RideRequestCard.tsx` |
| Stats boxes | `components/dashboard/StatsGrid.tsx` |
| Bottom navigation | `components/BottomNav.tsx` |
| Map change | `components/dashboard/MiniMap.tsx` |
| GPS logic | `lib/gpsQueue.ts` |
| API calls | `lib/api.ts` |
| Real-time updates | `lib/socket.tsx` |
| Earnings page | `pages/Earnings.tsx` |
| Colors/theme | `src/index.css` |

---

# VENDOR APP

## Location: `artifacts/vendor-app/src/`

## Pages
```
pages/
├── Dashboard.tsx       ← Main dashboard
│                           - Today's orders
│                           - Revenue stats
│                           - Recent orders
├── Orders.tsx          ← Incoming orders manage
│                           - Accept/reject orders
│                           - Mark as ready
├── Products.tsx        ← Products list + add/edit/delete
├── Analytics.tsx       ← Sales charts & analytics
├── Store.tsx           ← Store settings + hours
├── Wallet.tsx          ← Wallet + withdrawal
├── Promos.tsx          ← Promo codes manage
├── Reviews.tsx         ← Customer reviews
├── Notifications.tsx   ← Notifications
├── Profile.tsx         ← Vendor profile
└── Login.tsx           ← Login page
```

## Components
```
components/
├── Header.tsx          ← Top header
├── BottomNav.tsx       ← Bottom navigation
├── SideNav.tsx         ← Side navigation (desktop)
├── ImageUploader.tsx   ← Product image upload
├── PageHeader.tsx      ← Page title header
└── ui/                 ← All UI components
```

## Core Logic
```
lib/
├── api.ts              ← All API calls
├── auth.tsx            ← Login/logout
├── push.ts             ← Push notifications
└── useConfig.ts        ← App config/settings
```

## Kya Fix Karna Ho Toh Kahan Jayen

| Kaam | File |
|------|------|
| Dashboard redesign | `pages/Dashboard.tsx` |
| Orders management | `pages/Orders.tsx` |
| Products add/edit | `pages/Products.tsx` |
| Sales analytics | `pages/Analytics.tsx` |
| Store settings | `pages/Store.tsx` |
| Bottom navigation | `components/BottomNav.tsx` |
| Image upload | `components/ImageUploader.tsx` |
| Colors/theme | `src/index.css` |

---

# CUSTOMER APP (Mobile — Expo)

## Location: `artifacts/ajkmart/`

## Pages/Screens
```
app/
├── (tabs)/
│   ├── index.tsx       ← Home screen (main)
│   ├── orders.tsx      ← My orders
│   ├── wallet.tsx      ← Wallet
│   └── profile.tsx     ← Profile
├── index.tsx           ← App entry
├── auth/
│   ├── index.tsx       ← Login
│   ├── register.tsx    ← Register
│   └── forgot-password.tsx ← Password reset
├── product/[id].tsx    ← Product detail page
├── cart/index.tsx      ← Shopping cart
├── order/index.tsx     ← Place order / checkout
├── orders/[id].tsx     ← Order detail + tracking
├── categories/index.tsx ← Categories browse
├── search.tsx          ← Search products
├── wishlist.tsx        ← Saved items
├── food/index.tsx      ← Food ordering
├── mart/index.tsx      ← Grocery mart
├── pharmacy/index.tsx  ← Medicine ordering
├── parcel/index.tsx    ← Send parcel
├── ride/index.tsx      ← Book a ride
├── van/
│   ├── index.tsx       ← Van booking
│   └── bookings.tsx    ← Van booking history
├── weather.tsx         ← Weather screen
└── my-reviews.tsx      ← My reviews
```

## Feature Components
```
components/
├── screens/
│   ├── MartScreenContent.tsx       ← Grocery mart UI
│   ├── FoodScreenContent.tsx       ← Food ordering UI
│   ├── PharmacyScreenContent.tsx   ← Pharmacy UI
│   ├── ParcelScreenContent.tsx     ← Parcel UI
│   └── VanScreenContent.tsx        ← Van booking UI
│
├── ride/
│   ├── RideBookingForm.tsx         ← Ride booking form
│   ├── RideTracker.tsx             ← Live ride tracking
│   ├── LiveTrackMap.tsx            ← Map (native)
│   ├── LiveTrackMap.web.tsx        ← Map (web)
│   ├── MapPickerModal.tsx          ← Pick location on map
│   └── NegotiationScreen.tsx      ← Ride price negotiation
│
├── profile/
│   ├── EditProfileModal.tsx        ← Edit profile popup
│   ├── AddressesModal.tsx          ← Manage addresses
│   ├── KycModal.tsx                ← KYC upload
│   └── NotificationsModal.tsx      ← Notification settings
│
└── ui/                             ← All UI components
    ├── Card.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── BottomSheet.tsx
    ├── Avatar.tsx
    ├── StatusBadge.tsx
    └── LoadingState.tsx
```

## Context (Global State)
```
context/
├── AuthContext.tsx         ← Login state, user info
├── CartContext.tsx         ← Shopping cart items
├── LocationContext.tsx     ← User location
├── PlatformConfigContext.tsx ← App settings
├── RiderLocationContext.tsx  ← Track rider on map
├── LanguageContext.tsx     ← Urdu/English language
└── ToastContext.tsx        ← Toast messages
```

## Design Tokens
```
constants/
├── colors.ts           ← App colors
├── typography.ts       ← Font sizes
├── rideTokens.ts       ← Ride-specific styles
└── serviceRegistry.ts  ← Which services are enabled
```

## Kya Fix Karna Ho Toh Kahan Jayen

| Kaam | File |
|------|------|
| Home screen redesign | `app/(tabs)/index.tsx` |
| Food ordering UI | `components/screens/FoodScreenContent.tsx` |
| Grocery mart UI | `components/screens/MartScreenContent.tsx` |
| Ride booking | `components/ride/RideBookingForm.tsx` |
| Live tracking | `components/ride/RideTracker.tsx` |
| Cart page | `app/cart/index.tsx` |
| Checkout | `app/order/index.tsx` |
| Product detail | `app/product/[id].tsx` |
| Profile page | `app/(tabs)/profile.tsx` |
| App colors | `constants/colors.ts` |
| Font sizes | `constants/typography.ts` |
| Login/logout logic | `context/AuthContext.tsx` |
| Cart logic | `context/CartContext.tsx` |
| API calls | `utils/api.ts` |

---

# SHARED LIBRARIES

## Location: `lib/`

```
lib/
├── db/
│   ├── schema.ts           ← Database tables definition
│   ├── index.ts            ← DB connection
│   └── migrations/         ← Database changes history
│
├── api-client-react/       ← React Query hooks for API
│   └── src/
│       ├── orders.ts       ← Order API hooks
│       ├── products.ts     ← Product API hooks
│       ├── rides.ts        ← Ride API hooks
│       └── ...
│
├── auth-utils/             ← JWT, session helpers
├── i18n/                   ← Urdu/English translations
├── api-spec/               ← API type definitions
└── service-constants/      ← App-wide constants
```

---

# QUICK REFERENCE — Kahan Kya Change Karein

## Colors/Theme Change
| App | File |
|-----|------|
| Admin Panel | `artifacts/admin/src/index.css` |
| Rider App | `artifacts/rider-app/src/index.css` |
| Vendor App | `artifacts/vendor-app/src/index.css` |
| Customer App | `artifacts/ajkmart/constants/colors.ts` |

## API URL Change
| App | File |
|-----|------|
| Admin Panel | `artifacts/admin/src/lib/api.ts` |
| Rider App | `artifacts/rider-app/src/lib/api.ts` |
| Vendor App | `artifacts/vendor-app/src/lib/api.ts` |
| Customer App | `artifacts/ajkmart/utils/api.ts` |

## New Page Add Karna
| App | Kahan Add Karein |
|-----|-----------------|
| Admin Panel | `artifacts/admin/src/pages/` + `App.tsx` mein route |
| Rider App | `artifacts/rider-app/src/pages/` + `App.tsx` mein route |
| Vendor App | `artifacts/vendor-app/src/pages/` + `App.tsx` mein route |
| Customer App | `artifacts/ajkmart/app/` mein file banao (auto-route) |

## New API Endpoint Add Karna
1. `artifacts/api-server/src/routes/` mein file banao ya existing mein add karo
2. `artifacts/api-server/src/routes/index.ts` mein register karo
3. Frontend mein `lib/api.ts` mein call add karo

## Database Table Change Karna
1. `lib/db/schema.ts` mein table update karo
2. `lib/db/migrations/` mein new migration file banao
3. `pnpm --filter @workspace/db run migrate` chalao

---

# REAL-TIME FEATURES (Socket.io)

| Event | Kahan se aata hai | Kahan jata hai |
|-------|------------------|----------------|
| `order:new` | Customer order place karta hai | Rider + Admin ko |
| `order:accepted` | Rider accept karta hai | Customer ko |
| `rider:location` | Rider GPS update | Customer + Admin ko |
| `ride:request` | Customer ride book karta hai | Rider ko |
| `ride:accepted` | Rider ride accept karta hai | Customer ko |

Socket server: `artifacts/api-server/src/lib/socketio.ts`
