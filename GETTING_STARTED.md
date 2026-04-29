# 🚀 Getting Started - Quick Navigation

Welcome! This AI-powered Sales CRM system is complete and ready to use. This file helps you navigate and understand everything that has been built.

---

## 📖 Documentation Guide

### For First-Time Users
1. **Start Here:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Overview of everything built
2. **Then Read:** [QUICKSTART.md](QUICKSTART.md) - 10-minute setup guide
3. **See Demo:** Follow the data flow in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### For Developers
1. **Setup:** [QUICKSTART.md](QUICKSTART.md) - Get everything running locally
2. **Code:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Coding guidelines and commands
3. **APIs:** [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - All endpoints with examples
4. **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design

### For DevOps/Operations
1. **First:** [OPERATIONS.md](OPERATIONS.md) - Server setup and management
2. **Maintenance:** [OPERATIONS.md#-maintenance-schedule](OPERATIONS.md) - Daily/weekly tasks
3. **Troubleshooting:** [OPERATIONS.md#-troubleshooting-common-issues](OPERATIONS.md) - Common fixes

### For Deployment
1. **Production Setup:** [docs/DEVELOPMENT.md#deployment](docs/DEVELOPMENT.md) - Deploy to servers
2. **Database:** [OPERATIONS.md#-database-management](OPERATIONS.md) - MySQL setup
3. **Security:** [OPERATIONS.md#-security-management](OPERATIONS.md) - HTTPS, JWT setup

---

## 🎯 What This System Does

```
┌─────────────────┐
│  E-commerce     │  Customer browses website
│  Demo Site      │  (events auto-tracked)
└────────┬────────┘
         │ (Events: page_view, clicks, cart, purchase)
         │
┌────────▼──────────────┐
│  Tracking SDK         │  Captures all user behavior
│  JavaScript Library   │  (runs on website)
└────────┬──────────────┘
         │ (Sends JSON events)
         │
┌────────▼─────────────────┐
│  Backend REST API        │  Stores events
│  Django + Python         │  Processes data
└────────┬─────────────────┘
         │
┌────────▼──────────────┐
│  Scoring Engine       │  AI analyzes behavior
│  (runs every 30 min)  │  Predicts lead quality
└────────┬──────────────┘
         │ (Updates lead scores)
         │
┌────────▼──────────────┐
│  CRM Dashboard        │  Sales team views
│  React Frontend       │  leads + recommendations
└───────────────────────┘
```

---

## 🗂️ Project Structure

```
📁 AI-based-sales-representative/
│
├── 📁 backend/              → Django REST API server
│   ├── config/              → Django configuration
│   ├── accounts/            → User & company management
│   ├── crm/                 → Leads, events, scoring
│   ├── core/                → JWT auth, tenant middleware
│   ├── scoring_engine.py    → AI scoring algorithm
│   ├── manage.py            → Django commands
│   └── requirements.txt      → Python dependencies
│
├── 📁 frontend/             → CRM Dashboard (React)
│   ├── src/
│   │   ├── pages/           → Login, Dashboard, Leads, Details
│   │   ├── context/         → Auth state management
│   │   ├── services/        → API client (Axios)
│   │   ├── components/      → Reusable UI components
│   │   └── App.js           → Main application
│   ├── public/              → Static HTML
│   └── package.json         → Node.js dependencies
│
├── 📁 ecommerce-demo/       → Sample e-commerce website
│   ├── src/
│   │   ├── pages/           → Home, Products, Cart, Checkout
│   │   ├── context/         → Cart state management
│   │   ├── components/      → Navigation, Product cards
│   │   └── App.js           → Main application
│   ├── public/              → Static HTML (loads SDK)
│   └── package.json         → Node.js dependencies
│
├── 📁 tracking-sdk/         → JavaScript event tracker
│   ├── src/
│   │   └── tracking-sdk.js  → Event capture library
│   ├── dist/                → Compiled version
│   └── webpack.config.js    → Build configuration
│
├── 📁 docs/                 → Documentation
│   ├── README.md            → Full system documentation
│   ├── ARCHITECTURE.md      → System design & data flows
│   ├── API_REFERENCE.md     → All API endpoints
│   └── DEVELOPMENT.md       → Developer guide
│
├── 📄 QUICKSTART.md         → 10-minute setup guide
├── 📄 PROJECT_SUMMARY.md    → Complete project overview
├── 📄 OPERATIONS.md         → System administration
└── 📄 GETTING_STARTED.md    → This file!
```

---

## ⚡ Quick Commands

### Start Everything (3 terminals)

```bash
# Terminal 1: Backend API
cd backend && python manage.py runserver

# Terminal 2: CRM Dashboard
cd frontend && npm install && npm start

# Terminal 3: E-commerce Demo
cd ecommerce-demo && npm install && npm start
```

Then open:
- **CRM Dashboard:** http://localhost:3000
- **E-commerce Site:** http://localhost:3001

### Run Scoring Engine

```bash
cd backend
python scoring_engine.py
```

### Database Setup

```bash
cd backend
python manage.py migrate        # Create tables
python manage.py createsuperuser # Create admin user
```

---

## 🧑‍💼 User Roles

### Admin
- Create company account
- Manage team members
- View all leads
- Change settings

### Sales Manager
- View dashboard
- Manage leads
- Assign leads to team
- Track KPIs

### Sales Representative
- View assigned leads
- Update lead status
- See recommendations
- Contact information

### Analyst
- View analytics
- Export reports
- Monitor performance

---

## 📊 Key Metrics Tracked

When a user visits the e-commerce site, the SDK automatically tracks:

| Metric | Description |
|--------|-------------|
| **Page Views** | How many pages visited |
| **Clicks** | Button/link interactions |
| **Time Spent** | Total seconds on site |
| **Cart Actions** | Add, remove, update items |
| **Purchase Intent** | Checkout initiation signals |
| **Device/Browser** | User environment info |

---

## 🤖 AI Lead Scoring

The scoring engine analyzes tracked behavior and produces:

```
Lead Score (0-100)
├── Engagement (20%) = visits×5 + clicks×2 + time×10
├── Intent (35%)     = purchase signals weighted high
├── Recency (15%)    = how recent was last activity
├── Frequency (20%)  = how often they interact
└── Behavior (10%)   = specific action scoring

Result:
  Hot (70+)   → "Call them immediately!"
  Warm (40-70) → "Send them an email"
  Cold (<40)   → "Run retargeting ads"
```

---

## 🔐 Authentication Flow

```
User visits CRM website
    ↓
Enters email & password
    ↓
Backend validates credentials
    ↓
Backend returns JWT token
    ↓
Token stored in browser
    ↓
All API requests include token
    ↓
Backend verifies company from token
    ↓
Only that company's data shown
```

---

## 📈 Sample Workflow

### Day 1: Setup
- [ ] Run quick start guide
- [ ] Create first company account
- [ ] Create team member accounts

### Day 2: Testing
- [ ] Visit e-commerce demo site
- [ ] Add products to cart
- [ ] Complete purchase
- [ ] Wait for scoring (every 30 min)

### Day 3: Results
- [ ] View dashboard with analytics
- [ ] See leads created automatically
- [ ] Check AI recommendations
- [ ] Take action (call, email, etc.)

---

## 🔍 Example Features

### Create a Customer Account
```bash
POST /api/auth/register/
{
  "company_name": "Acme Corp",
  "email": "john@acmecorp.com",
  "password": "secure123"
}
```

### Track User Event
```bash
POST /api/crm/events/track/
{
  "unique_identifier": "user_123",
  "event_type": "add_to_cart",
  "session_id": "session_456"
}
```

### Get Scoring Recommendations
```bash
GET /api/crm/recommendations/
Response: [
  {
    "lead_id": 1,
    "recommendation": "Call this lead immediately",
    "reasoning": "Hot lead with purchase intent",
    "priority": "urgent"
  }
]
```

---

## 🏗️ Technology Stack at a Glance

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Tailwind CSS |
| **Backend** | Django 4 + REST Framework |
| **Database** | MySQL / SQLite |
| **Auth** | JWT Tokens |
| **Tracking** | Vanilla JavaScript SDK |
| **AI/ML** | Python (scikit-learn, Pandas) |
| **Charts** | Recharts |

---

## 📚 Learn More

### Understanding the System

1. **How events flow?** → See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#event-flow)
2. **How scoring works?** → See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#scoring-algorithm)
3. **How data isolated?** → See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#multi-tenant-architecture)
4. **All API endpoints?** → See [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

### Configuration & Deployment

1. **Environment variables?** → See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#environment-variables)
2. **Deploy to production?** → See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#deployment)
3. **Run scoring on schedule?** → See [OPERATIONS.md](OPERATIONS.md#-scheduling-scoring-engine)
4. **Setup MySQL?** → See [OPERATIONS.md](OPERATIONS.md#-database-management)

### Troubleshooting

1. **Something broken?** → See [OPERATIONS.md#-troubleshooting-common-issues](OPERATIONS.md)
2. **How to debug?** → See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#debugging)
3. **Database problems?** → See [OPERATIONS.md](OPERATIONS.md)

---

## 🎯 Next Steps

### If you're new to everything:
**→ Open [QUICKSTART.md](QUICKSTART.md) and follow the 10-minute setup**

### If you want to understand what's built:
**→ Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete overview**

### If you want to deploy to production:
**→ Follow [OPERATIONS.md](OPERATIONS.md) for server setup**

### If you want to customize the code:
**→ Use [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) as your coding guide**

### If you want to integrate with other tools:
**→ Check [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for all endpoints**

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend running: `curl http://localhost:8000/api/auth/me/`
- [ ] Frontend running: Visit http://localhost:3000
- [ ] E-commerce runs: Visit http://localhost:3001
- [ ] Can register account: Try signup at http://localhost:3000/register
- [ ] Can login: Try login with created account
- [ ] Events tracked: Visit e-commerce, check network tab
- [ ] Scoring runs: `python scoring_engine.py` (no errors)
- [ ] Dashboard shows leads: Login to CRM, check Leads page

All passing? **You're ready to go!** 🎉

---

## 📞 Common Questions

**Q: Where is the database?**
A: Default SQLite in `db.sqlite3`. For production, use MySQL. See [OPERATIONS.md](OPERATIONS.md)

**Q: How often does scoring run?**
A: Every 30 minutes via cron job. See [OPERATIONS.md#-scheduling-scoring-engine](OPERATIONS.md) to setup.

**Q: Can I white-label this?**
A: Yes! Change company name, logo, and colors. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

**Q: How do I add more tracking events?**
A: Edit `tracking-sdk/src/tracking-sdk.js` and backend `crm/models.py`. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes! Change `DATABASE_URL` in settings.py. See [OPERATIONS.md](OPERATIONS.md)

**Q: How secure is this?**
A: JWT auth, CORS protection, tenant isolation, bcrypt passwords. See [OPERATIONS.md#-security-management](OPERATIONS.md)

---

## 🚀 You're All Set!

This is a **production-ready system** that you can:
- ✅ Deploy immediately to servers
- ✅ Customize with your branding
- ✅ Extend with additional features
- ✅ Scale to thousands of companies
- ✅ Learn from and improve

**Start with [QUICKSTART.md](QUICKSTART.md) and you'll have everything running in 10 minutes!**

---

**Still have questions?**
- Check the relevant documentation file above
- Look at the code - it's well-organized and commented
- Review the [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete technical details
- See [OPERATIONS.md](OPERATIONS.md) for admin/deployment questions

**Happy building! 🎉**
