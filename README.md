# 🍲 Taste of West Africa

A full-stack restaurant ordering system built for Taste of West Africa — an authentic Nigerian restaurant in Woolwich, London SE18.

---

## 🌍 Live Links

- **Customer Website:** https://towa-client.onrender.com
- **Admin Dashboard:** https://towa-admin.onrender.com
- **Backend API:** https://towa-backend.onrender.com

---

## 📱 What It Does

### Customer Website
- Browse full menu with category filters
- Add dishes to cart
- Checkout with card (Stripe) or cash
- Order confirmation with reference number
- Fully responsive on mobile and desktop

### Admin Dashboard
- Secure login with email and password
- View live orders as they come in
- Update order status (New → Preparing → Ready → Delivered)
- Today's revenue and order stats
- Toggle menu items on/off when sold out
- Update prices instantly
- Add new dishes to the menu

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React + Vite            |
| Backend    | Node.js + Express       |
| Database   | MongoDB Atlas           |
| Payments   | Stripe                  |
| Email      | Nodemailer + Gmail      |
| Auth       | JWT + bcrypt            |
| Hosting    | Render (free tier)      |

---

## 📁 Project Structure
```
taste-of-west-africa/
├── server/         → Node.js + Express backend API
├── client/         → React customer website
└── admin/          → React admin dashboard
```

---

## 🚀 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/Manish2361/taste-of-west-africa.git
cd taste-of-west-africa
```

### 2. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### 3. Set up environment variables
Create `.env` file in `server/` folder:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD_HASH=your_bcrypt_hash
STRIPE_SECRET_KEY=sk_test_your_key
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
RESTAURANT_NAME=Taste of West Africa
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

Create `.env` file in `client/` folder:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_API_URL=http://localhost:5000
```

### 4. Seed the database
```bash
cd server
node scripts/seedMenu.js
```

### 5. Run all three apps
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Customer site
cd client && npm run dev

# Terminal 3 - Admin dashboard
cd admin && npm run dev
```

### 6. Open in browser
| App | URL |
|-----|-----|
| Customer website | http://localhost:5173 |
| Admin dashboard | http://localhost:5174 |
| Backend API | http://localhost:5000/api/health |

---

## 💳 Test Card Details
```
Card number: 4242 4242 4242 4242
Expiry:      12/26
CVC:         123
```

---

## 📦 Deployment

See [DEPLOY.md](./DEPLOY.md) for full step-by-step deployment guide to Render + MongoDB Atlas.

---

## 💰 Business Case

> Just Eat charges 14% commission per order.
> On £3,000/month of orders that's £420/month lost.
> This website costs £0/month to run.
> The restaurant saves £5,000+ per year.

---

## 👨‍💻 Built By

**Manish Ray** — Full Stack MERN Developer
- GitHub: https://github.com/Manish2361
