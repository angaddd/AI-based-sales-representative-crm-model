# Operations & Management Guide

This guide covers running, managing, and maintaining the AI Sales Representative CRM system.

---

## 🔧 System Administration

### Initial Setup

**1. Install Dependencies**

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# E-commerce Demo
cd ../ecommerce-demo
npm install

# Tracking SDK (optional - already bundled)
cd ../tracking-sdk
npm install
```

**2. Database Setup**

```bash
cd backend

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser
```

**3. Environment Configuration**

Create `.env` files with required variables:

```bash
# backend/.env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
DATABASE_URL=mysql://user:password@localhost:3306/crm_db
JWT_SECRET=your-jwt-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000

# frontend/.env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SDK_URL=http://localhost:3002/tracking-sdk.js

# ecommerce-demo/.env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SDK_URL=http://localhost:3002/tracking-sdk.js
```

---

## 🚀 Running the System

### Development Mode (Local)

**Terminal 1 - Backend Server**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend (CRM Dashboard)**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

**Terminal 3 - E-commerce Demo**
```bash
cd ecommerce-demo
npm start
# Runs on http://localhost:3001
```

**Terminal 4 - Tracking SDK Server** (optional, if serving locally)
```bash
cd tracking-sdk
npm start
# Serves on http://localhost:3002
```

### Production Mode

**Backend with Gunicorn**
```bash
cd backend
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
```

**Frontend Build & Serve**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify/Vercel
```

**E-commerce Demo Build**
```bash
cd ecommerce-demo
npm run build
# Deploy dist/ folder alongside frontend
```

---

## 📊 Database Management

### Backup Database

```bash
# MySQL backup
mysqldump -u root -p crm_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p crm_db < backup_20240101.sql

# SQLite backup
cp db.sqlite3 db.sqlite3.backup
```

### Database Optimization

```bash
# Connect to database
python manage.py dbshell

# Run optimization (MySQL)
OPTIMIZE TABLE leads, events, companies, accounts_companyuser;

# Create indexes (if not auto-created)
CREATE INDEX idx_lead_company ON crm_lead(company_id);
CREATE INDEX idx_event_company ON crm_event(company_id);
CREATE INDEX idx_score_date ON crm_leadscore(created_at);
```

### Data Maintenance

```bash
# Delete old events (older than 90 days)
python manage.py shell
from datetime import timedelta
from django.utils import timezone
from crm.models import Event
Event.objects.filter(created_at__lt=timezone.now()-timedelta(days=90)).delete()

# Archive old scores
python manage.py shell
from crm.models import LeadScore
# Keep only last 12 months
LeadScore.objects.filter(created_at__lt=timezone.now()-timedelta(days=365)).delete()
```

---

## 🤖 Scheduling Scoring Engine

### Automatic Scoring (Every 30 Minutes)

**Linux/Mac with Cron**
```bash
# Edit crontab
crontab -e

# Add this line (runs every 30 minutes)
*/30 * * * * cd /path/to/backend && python scoring_engine.py >> logs/scoring.log 2>&1
```

**Bash Script Wrapper**
```bash
#!/bin/bash
# run_scoring.sh
cd /path/to/backend
source venv/bin/activate
python scoring_engine.py
```

Make executable:
```bash
chmod +x run_scoring.sh
```

**Windows with Task Scheduler**
```
Create a task:
- Trigger: Repeat every 30 minutes
- Action: Run "python" with arguments "D:\path\to\scoring_engine.py"
```

**Docker Scheduler**
```dockerfile
# Docker Cron Container
FROM python:3.9
RUN apt-get update && apt-get install -y cron
COPY backend /app/backend
COPY cron_config /etc/cron.d/scoring_cron
RUN chmod 0644 /etc/cron.d/scoring_cron
CMD cron -f
```

### Manual Scoring

```bash
cd backend

# Score all leads
python scoring_engine.py

# Or from Django shell
python manage.py shell
from scoring_engine import run_scoring
run_scoring()
```

---

## 📈 Monitoring & Logging

### View Logs

```bash
# Django logs
tail -f logs/django.log

# Scoring engine logs
tail -f logs/scoring.log

# API error logs
tail -f logs/api_errors.log
```

### Database Queries

Enable Django debug toolbar in development:

```python
# settings.py
INSTALLED_APPS += [
    'debug_toolbar',
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

INTERNAL_IPS = ['127.0.0.1']
```

### Performance Monitoring

```bash
# Check slow queries
python manage.py shell
from django.db import connection
from django.test.utils import CaptureQueriesContext

with CaptureQueriesContext(connection) as context:
    # Your code here
    pass

for query in context:
    print(f"Time: {query['time']}s - {query['sql']}")
```

---

## 👥 User & Company Management

### Create Company Admin User

```bash
python manage.py shell
from django.contrib.auth.models import User
from accounts.models import Company, CompanyUser

# Create company
company = Company.objects.create(
    name="Acme Corp",
    subscription_plan="premium",
    monthly_limit=10000
)

# Create user
user = User.objects.create_user(
    username="john@acmecorp.com",
    email="john@acmecorp.com",
    password="securepassword123"
)

# Link user to company
CompanyUser.objects.create(
    user=user,
    company=company,
    role="admin"
)
```

### Bulk User Import

```python
# import_users.py
import csv
from django.contrib.auth.models import User
from accounts.models import Company, CompanyUser

with open('users.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        user = User.objects.create_user(
            username=row['email'],
            email=row['email'],
            password=row['password']
        )
        company = Company.objects.get(id=row['company_id'])
        CompanyUser.objects.create(
            user=user,
            company=company,
            role=row['role']
        )
```

Run:
```bash
python manage.py shell < import_users.py
```

---

## 🔒 Security Management

### Password Reset

```bash
python manage.py shell
from django.contrib.auth.models import User

user = User.objects.get(username="user@example.com")
user.set_password("newpasswordhere")
user.save()
```

### JWT Token Management

Tokens expire by default after 24 hours. Change in settings.py:

```python
JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': timedelta(hours=24),
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=7),
}
```

### Require HTTPS

```python
# settings.py
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
HSTS_SECONDS = 31536000
```

### API Key Management

```bash
python manage.py shell
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

user = User.objects.get(username="api_user@example.com")
token, created = Token.objects.get_or_create(user=user)
print(f"API Key: {token.key}")
```

---

## 🧪 Testing & Validation

### Run Unit Tests

```bash
cd backend
python manage.py test

# Specific app
python manage.py test accounts

# With coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### API Testing

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Test lead retrieval (with token)
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:8000/api/crm/leads/

# Test event tracking
curl -X POST http://localhost:8000/api/crm/events/track/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{
    "unique_identifier": "user123",
    "event_type": "page_view",
    "session_id": "session_123",
    "url": "http://example.com/product",
    "page_depth": 2
  }'
```

---

## 📱 Frontend Troubleshooting

### Clear Cache & Rebuild

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Debugging React

Enable React Developer Tools in browser:
- Chrome: Install React Developer Tools extension
- Firefox: Install React Developer Tools extension
- Use browser console to inspect components

### API Connection Issues

```javascript
// Check API configuration
console.log(process.env.REACT_APP_API_URL);

// Test API connectivity
fetch(`${process.env.REACT_APP_API_URL}/api/auth/me/`)
  .then(r => r.json())
  .catch(e => console.error('API Error:', e))
```

---

## 🚨 Troubleshooting Common Issues

### Issue: "ModuleNotFoundError: No module named 'django'"

**Solution:**
```bash
pip install -r requirements.txt
# Or in venv:
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "CORS error" when accessing API

**Solution:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourdomain.com"
]
```

### Issue: "TypeError: Object of type datetime is not JSON serializable"

**Solution:**
Use DjangoJSONEncoder in serializers:
```python
from django.core.serializers.json import DjangoJSONEncoder
import json
response = json.dumps(data, cls=DjangoJSONEncoder)
```

### Issue: Events not being tracked

**Solution:**
1. Check SDK is loaded: `window.trackingSDK` in browser console
2. Verify token in localStorage: `localStorage.getItem('auth_token')`
3. Check API URL: `console.log(process.env.REACT_APP_API_URL)`
4. Check network tab for failed POST to `/api/crm/events/track/`

### Issue: Scoring not updating leads

**Solution:**
1. Verify scoring engine is scheduled
2. Check for errors: `tail -f logs/scoring.log`
3. Run manually: `python scoring_engine.py`
4. Verify events exist: Visit lead detail page
5. Check company has an active plan

### Issue: Login keeps failing

**Solution:**
1. Verify user exists: `python manage.py shell`
2. Check JWT secret is same in backend: `settings.py`
3. Verify email format is correct
4. Reset password: `user.set_password('new')`

---

## 📊 Database Queries (Admin Use)

### Get Company Statistics

```sql
SELECT 
  c.name,
  COUNT(DISTINCT cu.id) as users,
  COUNT(DISTINCT l.id) as leads,
  COUNT(DISTINCT e.id) as events
FROM accounts_company c
LEFT JOIN accounts_companyuser cu ON c.id = cu.company_id
LEFT JOIN crm_lead l ON c.id = l.company_id
LEFT JOIN crm_event e ON c.id = e.company_id
GROUP BY c.id, c.name;
```

### Get Top Leads by Score

```sql
SELECT id, name, score, temperature, email
FROM crm_lead
WHERE company_id = 1
ORDER BY score DESC
LIMIT 10;
```

### Get Recent Events

```sql
SELECT 
  e.event_type,
  e.created_at,
  l.name as lead_name,
  COUNT(*) as count
FROM crm_event e
JOIN crm_lead l ON e.lead_id = l.id
WHERE e.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY e.event_type, DATE(e.created_at)
ORDER BY e.created_at DESC;
```

---

## 🔄 Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor database size
- [ ] Verify scoring engine ran

### Weekly
- [ ] Backup database
- [ ] Review API performance
- [ ] Check user activity
- [ ] Monitor disk space

### Monthly
- [ ] Database optimization
- [ ] Performance review
- [ ] Security audit
- [ ] Update dependencies
- [ ] Review scaling needs

### Quarterly
- [ ] Full system backup
- [ ] Disaster recovery test
- [ ] Capacity planning
- [ ] Feature planning

---

## 📞 Support Checklist

When helping users, verify:

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Database connection working
- [ ] JWT tokens valid
- [ ] CORS configured
- [ ] Company isolation working
- [ ] Scoring engine has run
- [ ] Events being tracked
- [ ] All migrations applied

---

## 🎯 Performance Tuning

### Database Performance

```python
# Use select_related for ForeignKey
Lead.objects.select_related('company', 'assigned_to').all()

# Use prefetch_related for reverse relationships
Company.objects.prefetch_related('leads', 'users').all()

# Use only() to limit fields
Lead.objects.only('id', 'name', 'score').all()
```

### Query Optimization

```python
# Batch operations
Lead.objects.bulk_create([lead1, lead2, lead3])

# Bulk updates
Lead.objects.filter(temperature='cold').update(needs_review=True)

# Use exists() not count()
if Lead.objects.filter(company_id=1).exists():
    # do something
```

### Caching

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def get_recommendations(request):
    # ...
```

---

This guide covers the essential operations for running and maintaining the AI Sales Representative CRM system in production.

For detailed development information, see `DEVELOPMENT.md`
For API documentation, see `docs/API_REFERENCE.md`
For architecture details, see `docs/ARCHITECTURE.md`
