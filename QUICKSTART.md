# Quick Start Guide

Get the complete multi-tenant CRM system up and running in 10 minutes!

## Prerequisites
- Node.js 16+ (download from nodejs.org)
- Python 3.8+ (download from python.org)
- Git (download from git-scm.com)

## 1. Install Backend (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create database
python manage.py migrate

# Start backend server (runs on port 8000)
python manage.py runserver
```

✅ Backend running at: http://localhost:8000

## 2. Install Frontend (3 minutes)

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm start
```

✅ CRM Dashboard at: http://localhost:3000

## 3. Install E-commerce Demo (2 minutes)

Open a **new terminal** and run:

```bash
# Navigate to ecommerce-demo directory
cd ecommerce-demo

# Install dependencies
npm install

# Start development server (runs on port 3001)
npm start
```

✅ E-commerce Site at: http://localhost:3001

## Testing the Complete Flow

### Step 1: Create Account (30 seconds)

1. Go to http://localhost:3000/register
2. Fill in the form:
   - Company Name: "My Company"
   - Company Email: "contact@mycompany.com"
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@mycompany.com"
   - Password: "TestPass123"
3. Click "Create Account"

### Step 2: Browse E-commerce (2 minutes)

1. Visit http://localhost:3001
2. Click "Shop Now"
3. Browse products
4. Click on a product to view details
5. Add items to cart
6. Go to checkout and complete purchase
   - Use any name and email
   - All data is tracked automatically

### Step 3: Run AI Scoring Engine (1 minute)

Open a **new terminal** and run:

```bash
cd backend
python scoring_engine.py
```

This will:
- Calculate scores for all tracked visitors
- Classify them as Hot/Warm/Cold
- Generate AI recommendations

### Step 4: View Results in CRM (1 minute)

1. Go back to http://localhost:3000
2. You should now see:
   - Dashboard with analytics
   - All visitors as leads
   - Click on any lead to see detailed info
   - AI-generated recommendations for each lead

## Key URLs

| Component | URL | Port |
|-----------|-----|------|
| CRM Dashboard | http://localhost:3000 | 3000 |
| E-commerce Site | http://localhost:3001 | 3001 |
| Backend API | http://localhost:8000 | 8000 |
| Admin Panel | http://localhost:8000/admin | 8000 |

## Test Credentials

After registration:
- Email: john@mycompany.com
- Password: TestPass123

## System Components

### 1. Backend (Django REST API)
- Models: Company, User, Lead, Event, Recommendation
- Authentication: JWT tokens
- Multi-tenant isolation
- Automatic lead scoring

### 2. Frontend (React Dashboard)
- Login/Register pages
- Dashboard with analytics
- Leads management table
- Lead detail pages with timeline
- AI recommendations viewer

### 3. E-commerce Demo
- Product listing
- Product details
- Shopping cart
- Checkout process
- Automatic event tracking

### 4. Tracking SDK
- Automatically captures user events
- Tracks: page views, clicks, time spent, purchases
- Sends data to backend in real-time

### 5. AI Scoring Engine
- Processes behavioral data
- Calculates lead scores (0-100)
- Classifies leads (Hot/Warm/Cold)
- Generates action recommendations

## What's Tracked?

The SDK automatically tracks:
- ✅ Page views
- ✅ Button clicks
- ✅ Form submissions
- ✅ Time spent on pages
- ✅ Product views
- ✅ Add to cart
- ✅ Cart removals
- ✅ Purchase completions
- ✅ Scroll depth

## Scoring Formula

Leads are scored on:
- **Engagement** (20%) - Visits, clicks, time spent
- **Intent** (35%) - Cart actions, checkouts, purchases
- **Recency** (15%) - How recently active
- **Frequency** (20%) - How often visiting
- **Behavior** (10%) - Specific actions

Score Range:
- 🔴 Hot: 70-100 (immediate follow-up)
- 🟡 Warm: 40-70 (nurture email)
- 🔵 Cold: 0-40 (retargeting ad)

## AI Recommendations

System automatically suggests:
- **Call** hot leads without contact
- **Email** warm leads with sustained interest
- **Retarget** cart abandonment
- **Demo** for high product interest
- **Proposal** for very engaged leads

## Troubleshooting

### Backend not starting?
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill process: kill -9 <PID>

# Or use different port
python manage.py runserver 8001
```

### Frontend failing to load?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### No events being tracked?
1. Check browser console for errors
2. Verify SDK is loaded: check Network tab
3. Check backend is running on port 8000
4. Verify CORS settings

### Leads not scoring?
```bash
# Manually run scoring engine
cd backend
python scoring_engine.py

# Check database for events
python manage.py shell
from crm.models import Event
Event.objects.all()  # Should show tracked events
```

## Next Steps

1. **Explore the Dashboard**
   - View analytics
   - Manage leads
   - Check recommendations

2. **Read Documentation**
   - [Full Documentation](../README.md)
   - [API Reference](../docs/API_REFERENCE.md)
   - [Development Guide](../docs/DEVELOPMENT.md)

3. **Customize for Your Site**
   - Add your e-commerce site
   - Integrate tracking SDK
   - Track custom events
   - View leads in dashboard

4. **Deploy to Production**
   - Use PostgreSQL instead of SQLite
   - Deploy backend to server
   - Deploy frontend to CDN
   - Set up automated scoring

## Commands Quick Reference

```bash
# Backend in terminal 1
cd backend && source venv/bin/activate && python manage.py runserver

# Frontend in terminal 2
cd frontend && npm start

# E-commerce in terminal 3
cd ecommerce-demo && npm start

# Scoring engine in terminal 4 (run periodically)
cd backend && python scoring_engine.py
```

## Support

- Check [Troubleshooting](../README.md#troubleshooting) section
- Review [API Reference](../docs/API_REFERENCE.md)
- Check logs in `backend/logs/`
- Browser console for frontend errors

## Common Questions

**Q: How often does scoring run?**
A: Manually on-demand. In production, use Celery to run every 30 minutes.

**Q: Can I use my own e-commerce site?**
A: Yes! Just add 1 script tag: `<script src="https://yourserver.com/tracking-sdk.js"></script>`

**Q: How is data isolated between companies?**
A: All queries automatically filtered by company_id. Tenant middleware ensures isolation.

**Q: Why aren't my events showing?**
A: Check network tab, verify SDK loaded, ensure backend is running, check CORS.

**Q: How do I export lead data?**
A: Use the API: `GET /api/crm/leads/` - returns JSON. Export to CSV as needed.

---

🎉 **That's it!** Your AI-powered CRM system is ready to use!

**Total setup time: ~10 minutes**
