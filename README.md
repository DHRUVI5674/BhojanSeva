# 🍲 BhojanSeva (भोजन सेवा)
> **Share Food. Spread Hope. Reduce Waste.**

BhojanSeva is a production-quality, full-stack food donation and redistribution platform built with a **Node.js/Express/MongoDB** REST API backend and a **React Native Expo (Expo Router)** mobile application written purely in **JavaScript and JSX**.

---

## 🌟 Key Features & Role Workflows

### 🍽️ 1. Food Donors (Restaurants, Caterers, Households, Hotels)
- Post surplus fresh cooked meals, raw staples, packaged goods, bakery items, or produce.
- Add food photographs using device camera or gallery (`expo-image-picker`).
- Auto-detect pickup location using GPS coordinates (`expo-location`).
- Set preparation timestamp, shelf-life expiry countdown, dietary classification (Pure Veg vs Non-Veg), and pickup instructions.
- Review incoming requests from recipient NGOs, approve or decline with notes.
- Real-time notification updates when a volunteer is assigned and food is collected.

### 🤝 2. Recipient NGOs & Community Shelters
- Browse nearby available food donations in real time with category filters and pure-veg toggles.
- Filter and search donations by title and pickup location.
- Submit structured food requests with required servings and destination address.
- Live status workflow tracking: `PENDING` ➔ `ACCEPTED` ➔ `ASSIGNED` ➔ `PICKED_UP` ➔ `DELIVERED`.
- Receive instant alerts on request acceptance and delivery transit.

### 🚚 3. Volunteers (Pickup & Doorstep Delivery)
- View open delivery tasks created whenever donors accept recipient food requests.
- 1-tap claim/accept delivery assignments.
- View step-by-step pickup and drop-off addresses with 1-tap donor and recipient contact details.
- Confirm food pickup from donor location (transitions status to `PICKED_UP` / in-transit).
- Confirm safe delivery to recipient shelter (transitions status to `DELIVERED`).
- Track completed delivery history and community impact statistics.

### 🛡️ 4. Administrators
- Live platform command center powered by real MongoDB aggregations (no mock counters).
- Monitor total registered users, donors, recipients, active volunteers, and total people fed.
- Full user governance: activate, deactivate, manage roles, or delete users.
- Full donation and request audit trail.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Mobile Frontend** | React Native, Expo SDK 58, Expo Router, JavaScript & JSX |
| **Icons & Styling** | Lucide React Native, React Native StyleSheet |
| **Mobile Hardware** | Expo ImagePicker (camera/gallery), Expo Location (GPS) |
| **Client Storage** | Expo SecureStore (encrypted JWT token persistence) |
| **API Networking** | Axios with interceptors & platform-smart base URL detection |
| **Backend Runtime** | Node.js (v22), Express.js (v5) |
| **Database** | MongoDB & Mongoose ORM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Security & Quality**| Helmet, CORS, Express Rate Limit, Express Validator, Morgan |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli` or via `npx expo`)
- Expo Go app on physical Android phone, or Android Studio Emulator

---

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017` or obtain a MongoDB Atlas connection string.

**To run local MongoDB:**
```powershell
mongod --dbpath "D:\BhojanSeva\backend\data\db" --port 27017
```

---

### Step 2: Configure & Start Backend Server

```powershell
cd D:\BhojanSeva\backend
npm install
```

Configure `.env` (a template is provided in `.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_EXPIRE=30d
CLIENT_URL=*
```

Start the backend:
```powershell
npm start
# Or for development with auto-reload:
npm run dev
```

The backend starts at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

**Run Backend Automated Test Suite:**
```powershell
npm test
```

---

### Step 3: Configure & Start Mobile Application

```powershell
cd D:\BhojanSeva\mobile
npm install
```

Configure `.env` (a template is provided in `.env.example`):
```env
# Use your computer's LAN IP address so physical phones and emulators can reach the backend:
EXPO_PUBLIC_API_URL=http://192.168.1.4:5000/api
```

Start Expo:
```powershell
npx expo start -c
```

**Running on Android:**
- Press `a` in terminal to launch in an Android Studio Emulator.
- Or scan the QR code using the **Expo Go** application on your physical Android smartphone (ensure phone and PC are connected to the same Wi-Fi network).

---

## ⚡ 1-Tap Demo Test Accounts

The mobile login screen includes **One-Tap Demo Test Buttons** for instant evaluation without typing:

| Role | Email | Password |
|---|---|---|
| **Donor** | `donor.demo@bhojanseva.org` | `Password123!` |
| **Recipient** | `recipient.demo@bhojanseva.org` | `Password123!` |
| **Volunteer** | `volunteer.demo@bhojanseva.org` | `Password123!` |
| **Admin** | `admin.demo@bhojanseva.org` | `Password123!` |

*Note: Tapping any demo button automatically provisions the account in MongoDB if it does not already exist.*

---

## 📁 Project Structure

```
D:\BhojanSeva
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection & env config
│   │   ├── controllers/     # Auth, Donation, Request, Volunteer, Admin controllers
│   │   ├── middleware/      # JWT Protect, Role Authorize, Validate, ErrorHandler
│   │   ├── models/          # User, Donation, Request, Task, Notification schemas
│   │   ├── routes/          # REST route handlers
│   │   ├── utils/           # JWT generator, notification dispatcher
│   │   ├── validators/      # Express-validator rules
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # Server bootstrap & graceful shutdown
│   ├── test/
│   │   └── api.test.js      # 19-test automated test suite
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── app/
│   │   ├── (auth)/          # Welcome, Login, Register, Forgot Password
│   │   ├── (tabs)/          # Home, Donations/Browse, Activity, Notifications, Profile
│   │   ├── donation/        # Create donation, Donation details
│   │   ├── task/            # Volunteer pickup & delivery workflow
│   │   ├── admin/           # User management, Donation audit
│   │   ├── index.jsx        # Auth redirection gatekeeper
│   │   └── _layout.jsx      # Root navigation layout
│   ├── components/          # Reusable Button, Input, Header, StatCard, Cards, EmptyState
│   ├── constants/           # Brand theme colors, API config
│   ├── context/             # AuthContext (SecureStore token & session restoration)
│   ├── services/            # Axios API client modules
│   ├── .env.example
│   ├── app.json
│   └── package.json
├── API_DOCUMENTATION.md     # Complete REST API reference
├── FINAL_TEST_REPORT.md     # Verified test report
└── README.md
```

---

## 📜 License
ISC License. Built for community food redistribution and hunger relief.
