# 🏪 GourmetHub - Full-Stack Restaurant Management System

A production-ready Full-Stack web application built with **Node.js, Express.js, MongoDB, Mongoose, EJS, and Tailwind CSS**. The system delivers comprehensive restaurant operations management, covering menu items (dishes), executive culinary talent (chefs), customer review ratings, and business analytics.

---

## 🌟 Key Features & Requirements Checklist

### ✅ Core Features
- **Full CRUD Operations**:
  - **Create**: Add new dishes and chefs with comprehensive server-side form validation.
  - **Read**: Browse menu items with strict **server-side pagination (6 items per page)**.
  - **Update**: Edit existing dishes, categories, pricing, and assigned chefs.
  - **Delete**: Remove items safely with an **interactive confirmation modal** and cascade cleanup.
- **Search & Filtering**:
  - Full-text search across dish name, description, and cuisine.
  - Multi-criteria filtering by **Category**, **Chef**, and **Max Price**.
  - Multi-column sorting (Newest, Price Low-High, Price High-Low, Highest Rated).
- **Mongoose Many-to-Many Relationships**:
  - Primary Entity: `Dish` (Menu items).
  - Secondary Entity: `Chef` (Executive and Sous chefs).
  - Bidirectional Mongoose `ObjectId` references (`dish.chefs` <-> `chef.dishes`).
  - **Cascade Cleanup**: Deleting a dish safely pulls references from all associated chefs; deleting a chef pulls references from all associated dishes.
- **Database Seeding**:
  - Robust seed script populating **14 signature dishes** and **10 master chefs** with photos, bios, reviews, and pre-linked many-to-many relationships.
- **Modern Responsive Design**:
  - Modern dark-mode aesthetic with warm amber and emerald accents.
  - Responsive navigation with search and mobile drawer menu.
  - Toast/Flash messages for success and error feedback with auto-dismissal.
- **Dashboard & Data Visualization**:
  - Multi-stage MongoDB Aggregation pipelines (`$group`, `$avg`, `$min`, `$max`, `$sort`).
  - Interactive **Chart.js** charts (Category pricing, Menu volume distribution, Dietary breakdown, Culinary specialties).
  - Real-time KPI summary cards.

### ⭐ Optional & Bonus Features Implemented
- **Customer Star Rating System**: 1–5 star rating submission with automated recalculation of average ratings.
- **CSV Data Export**: One-click download of the complete menu catalog (`/dishes/export/csv`).
- **RESTful API**: Clean JSON endpoints (`/api/dishes`, `/api/chefs`, `/api/stats`).
- **Zero-Setup Database Fallback**: Out-of-the-box in-memory MongoDB fallback if a local `mongod` instance is not running.

---

## 📁 Project Architecture

```
c:\Users\DELL\Desktop\Test\
├── controllers/
│   ├── analyticsController.js # (incorporated in indexController.js)
│   ├── apiController.js       # REST API endpoints
│   ├── chefController.js      # Chef CRUD & relationship sync
│   ├── dishController.js      # Dish CRUD, pagination, search, CSV export
│   └── indexController.js     # Home & dashboard aggregation pipelines
├── db/
│   ├── connection.js          # Mongoose connection with resilient fallback
│   └── seed/
│       └── seed.js            # Database seeding script (14 dishes, 10 chefs)
├── middleware/
│   ├── errorHandler.js        # 404 and 500 error handlers
│   ├── flash.js               # Flash messages & template context locals
│   └── validation.js          # express-validator schemas
├── models/
│   ├── Chef.js                # Secondary entity schema
│   ├── Dish.js                # Primary entity schema
│   └── Review.js              # Customer reviews & ratings
├── public/
│   ├── css/
│   │   └── style.css          # Custom scrollbars, glassmorphism, animations
│   └── js/
│       ├── charts.js          # Chart.js initialization
│       └── main.js            # Modal controls, mobile drawer, alert dismissals
├── routes/
│   ├── apiRoutes.js           # REST API routes
│   ├── chefRoutes.js          # Chef web routes
│   ├── dishRoutes.js          # Dish web routes
│   └── indexRoutes.js         # Home & dashboard routes
├── views/
│   ├── chefs/                 # Chef templates (index, show, new, edit)
│   ├── dashboard/             # Analytics & Chart.js dashboard
│   ├── dishes/                # Dish templates (index, show, new, edit)
│   ├── layouts/               # Main wrapper, navbar, footer
│   ├── partials/              # Flash messages, pagination, delete modal
│   ├── 404.ejs                # Not found view
│   ├── 500.ejs                # Server error view
│   └── index.ejs              # Landing / showcase view
├── .env                       # Active environment configuration
├── .env.example               # Environment configuration template
├── package.json               # Dependencies and scripts
└── server.js                  # Application entry point
```

---

## 🗄️ MongoDB Database Schema

### 1. Primary Entity: `Dish`
```javascript
{
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'] 
  },
  cuisine: { type: String, required: true },
  imageUrl: { type: String },
  prepTime: { type: Number, required: true, min: 1 },
  calories: { type: Number, min: 0 },
  isVegetarian: { type: Boolean, default: false },
  isChefSpecial: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  chefs: [{ type: Schema.Types.ObjectId, ref: 'Chef' }],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Secondary Entity: `Chef`
```javascript
{
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  bio: { type: String },
  specialty: { type: String, required: true },
  experienceYears: { type: Number, required: true, min: 1 },
  avatarUrl: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  rating: { type: Number, default: 4.8 },
  dishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bonus Entity: `Review`
```javascript
{
  dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  authorName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: Date
}
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18 or newer recommended, tested on Node v24)
- (Optional) MongoDB installed locally or MongoDB Atlas connection string. If not installed, the app automatically runs an in-memory database!

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
A `.env` file is already generated with defaults:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_db
SESSION_SECRET=gourmet_hub_super_secret_session_key_2026
NODE_ENV=development
```

### 3. Seed the Database
To populate the database with 14 dishes, 10 chefs, and reviews:
```bash
npm run seed
```

### 4. Start the Application
- **Production start**:
  ```bash
  npm start
  ```
- **Development mode (auto-reload)**:
  ```bash
  npm run dev
  ```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🌐 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Home page showcase with specials & chefs |
| `GET` | `/dishes` | Menu items with pagination (6/page), search, & filters |
| `GET` | `/dishes/new` | Form to create a new dish |
| `POST` | `/dishes` | Create dish with validation & relationship sync |
| `GET` | `/dishes/:id` | Dish detail page with reviews & assigned chefs |
| `GET` | `/dishes/:id/edit` | Form to edit dish |
| `PUT` | `/dishes/:id` | Update dish & sync chef associations |
| `DELETE` | `/dishes/:id` | Delete dish with cascade cleanup |
| `POST` | `/dishes/:id/reviews` | Add customer rating & review |
| `GET` | `/dishes/export/csv` | Download complete menu catalog as CSV |
| `GET` | `/chefs` | Chef directory with specialties |
| `GET` | `/chefs/new` | Form to register a chef |
| `POST` | `/chefs` | Register chef & assign dishes |
| `GET` | `/chefs/:id` | Chef profile & list of mastered dishes |
| `GET` | `/chefs/:id/edit` | Form to edit chef |
| `PUT` | `/chefs/:id` | Update chef & sync dish associations |
| `DELETE` | `/chefs/:id` | Delete chef with cascade cleanup |
| `GET` | `/dashboard` | Business analytics & Chart.js visualizations |
| `GET` | `/api/dishes` | REST API: all dishes (JSON) |
| `GET` | `/api/dishes/:id` | REST API: single dish (JSON) |
| `GET` | `/api/chefs` | REST API: all chefs (JSON) |
| `GET` | `/api/chefs/:id` | REST API: single chef (JSON) |
| `GET` | `/api/stats` | REST API: aggregate statistics (JSON) |

---

## 🧪 Verification & Testing
1. **Pagination**: Browse to `/dishes` and verify that exactly 6 items are shown per page.
2. **Search**: Enter "Pasta" or "Lamb" in the search input and verify filtered results.
3. **Relationships**: Create a dish, assign 2 chefs, and verify the dish appears under both chefs' profiles.
4. **Cascade Cleanup**: Delete a chef and verify they are cleanly removed from all associated dishes without dangling IDs.
5. **Analytics**: Visit `/dashboard` to inspect live aggregations and Chart.js graphs.
