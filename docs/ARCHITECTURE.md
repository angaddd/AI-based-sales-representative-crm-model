# Architecture Overview

## System Diagram

```
                    ┌─────────────────────────────────────┐
                    │   E-Commerce Demo Website            │
                    │   (React + JavaScript Tracking SDK)  │
                    │   http://localhost:3001              │
                    └────────────┬────────────────────────┘
                                 │
                    Tracks all user interactions:
                    - Page views
                    - Clicks
                    - Forms
                    - Purchases
                                 │
                    ┌────────────▼────────────────────────┐
                    │  JavaScript Tracking SDK             │
                    │  - Captures events                   │
                    │  - Batches & queues                  │
                    │  - Real-time transmission            │
                    │  - Offline support                   │
                    └────────────┬────────────────────────┘
                                 │
        ┌────────────────────────▼────────────────────────┐
        │         Django REST Backend                      │
        │         http://localhost:8000                    │
        │                                                   │
        │  ┌─────────────────────────────────────┐        │
        │  │ REST API Endpoints                   │        │
        │  │ - Authentication (JWT)               │        │
        │  │ - Event tracking                     │        │
        │  │ - Lead management                    │        │
        │  │ - Company management                 │        │
        │  │ - Recommendations                    │        │
        │  └─────────────────────────────────────┘        │
        │                                                   │
        │  ┌─────────────────────────────────────┐        │
        │  │ AI Scoring Engine (Python)           │        │
        │  │ - Process behavioral data             │        │
        │  │ - Calculate lead scores              │        │
        │  │ - Generate recommendations            │        │
        │  │ - Run on schedule (every 30 min)     │        │
        │  └─────────────────────────────────────┘        │
        │                                                   │
        │  ┌─────────────────────────────────────┐        │
        │  │ Middleware                           │        │
        │  │ - JWT Authentication                │        │
        │  │ - CORS handling                      │        │
        │  │ - Tenant isolation                   │        │
        │  │ - Request logging                    │        │
        │  └─────────────────────────────────────┘        │
        │                                                   │
        │  ┌─────────────────────────────────────┐        │
        │  │ Database Models                      │        │
        │  │ - Company (Tenants)                  │        │
        │  │ - Users (with roles)                 │        │
        │  │ - Leads (with scoring)              │        │
        │  │ - Events (behavioral data)           │        │
        │  │ - Recommendations (AI actions)      │        │
        │  └─────────────────────────────────────┘        │
        └────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼────────────────────────┐
        │     MySQL/SQLite Database            │
        │     (Multi-tenant data storage)      │
        │                                       │
        │ Tables:                               │
        │ - accounts_company                    │
        │ - accounts_companyuser                │
        │ - crm_lead                            │
        │ - crm_event                           │
        │ - crm_leadscore                       │
        │ - crm_recommendation                  │
        └────────────┬────────────────────────┘
                     │
        ┌────────────▼────────────────────────┐
        │   Sales Rep CRM Dashboard            │
        │   (React + Tailwind CSS)             │
        │   http://localhost:3000              │
        │                                       │
        │ Features:                             │
        │ - Authentication                      │
        │ - Dashboard with analytics            │
        │ - Leads management                    │
        │ - Lead details & timeline             │
        │ - AI recommendations                  │
        │ - Company management                  │
        └────────────────────────────────────┘
```

## Data Flow

### 1. Event Capture → Backend

```
User Action on E-commerce Site
         ↓
Tracking SDK detects event
         ↓
Creates event object with:
- unique_identifier (user ID)
- event_type (page_view, click, etc.)
- event_data (custom fields)
- session_id (tracking visit)
- timestamp
         ↓
Batches events (max 10 or every 30s)
         ↓
Sends to /api/crm/events/track/
         ↓
Backend creates Event record
         ↓
Automatically creates/updates Lead
         ↓
Stores in MySQL database
```

### 2. Scoring & Recommendations

```
Every 30 minutes (scheduled task)
         ↓
Scoring Engine starts
         ↓
For each company:
  - Fetch all leads
  - For each lead, calculate:
    * Engagement score (20%)
    * Intent score (35%)
    * Recency score (15%)
    * Frequency score (20%)
    * Behavior score (10%)
         ↓
  - Weighted average = Lead Score
  - Classify: Hot/Warm/Cold
  - Estimate conversion rate
         ↓
  - Save score to LeadScore table
  - Update Lead.score, temperature
         ↓
  - Generate AI Recommendations:
    * Rule 1: Hot leads without contact → Call
    * Rule 2: Warm leads with sustained interest → Email
    * Rule 3: Cart abandonment → Retarget
    * Rule 4: High product interest → Demo
         ↓
- Create Recommendation records
- Set priority based on lead score
- Calculate confidence scores
         ↓
Recommendations visible in CRM dashboard
```

### 3. Sales Rep Views Results

```
Sales Rep logs into CRM Dashboard
         ↓
Calls /api/crm/leads/analytics/
         ↓
Backend returns:
- Total leads
- Hot/warm/cold counts
- Average score
- Conversion rates
- Status distribution
         ↓
Calls /api/crm/leads/
         ↓
Backend returns paginated leads list
         ↓
Rep sees all leads with:
- Score
- Temperature (color-coded)
- Recent activity
- Assigned rep
         ↓
Rep clicks on a lead
         ↓
Calls /api/crm/leads/{id}/
         ↓
Backend returns:
- Full lead details
- All events (timeline)
- Score history
- AI recommendations
         ↓
Rep sees comprehensive view of:
- When customer first visited
- What pages they viewed
- How long they spent
- What they clicked
- Items they added to cart
- If they purchased
- Recommended next actions
         ↓
Rep clicks "Action" on recommendation
         ↓
Calls POST /api/crm/recommendations/{id}/action/
         ↓
Recommendation marked as actioned
         ↓
Backend can track effectiveness
- Which recommendations lead to conversions
- Which actions work best
- Feedback for model improvement
```

## Multi-Tenant Architecture

### Company Isolation

```
Company A                          Company B
├── Users (admin, reps)            ├── Users (admin, reps)
├── Leads (isolated)               ├── Leads (isolated)
├── Events (isolated)              ├── Events (isolated)
└── Recommendations (isolated)     └── Recommendations (isolated)

Database:
Every table has company_id foreign key
All queries automatically filtered by company_id
```

### Query Isolation Example

```python
# For Company A (id=1)
leads = Lead.objects.filter(company_id=1)

# For Company B (id=2)
leads = Lead.objects.filter(company_id=2)

# Middleware automatically adds this filter
# Apps can't accidentally access other company data
```

## Authentication & Authorization

### JWT Token Flow

```
User submits credentials
         ↓
Backend validates email/password
         ↓
Generate JWT token with:
- user_id
- company_id (tenant_id)
- exp (expiration time)
- iat (issued at)
         ↓
Return token to frontend
         ↓
Frontend stores in localStorage
         ↓
All requests include: Authorization: Bearer {token}
         ↓
Backend validates token:
- Check signature
- Check expiration
- Extract company_id
- Set request.user and request.tenant_id
         ↓
Middleware applies tenant filter
         ↓
All data automatically scoped to company
```

### Role-Based Access (Future)

```
Company Admin
  ├── Can manage all leads
  ├── Can manage users
  ├── Can view analytics
  └── Can configure settings

Manager
  ├── Can manage assigned leads
  ├── Can invite users
  └── Can view team analytics

Sales Rep
  ├── Can view assigned leads
  ├── Can update lead status
  └── Can view recommendations

Analyst
  ├── Can view all leads
  ├── Can view analytics
  └── Can export data
```

## Scoring Algorithm Breakdown

### Engagement Score (20%)

```
Points = (visits × 5) + (clicks × 2) + (hours × 10)
- 1 visit = 5 points
- 1 click = 2 points
- 1 hour = 10 points (max 100)
Example: 10 visits + 15 clicks + 2 hours = 80 points
```

### Intent Score (35%)

```
Points = (high_intent_count × 40) + (medium_intent_count × 20)

High-intent events:
- Add to cart: 40 points
- Start checkout: 40 points
- Complete purchase: 40+ points
- Form submission: 40 points

Medium-intent events:
- View product: 20 points
- Form start: 20 points
- Click CTA: 20 points

Example: 2 cart + 1 purchase = (2×40) + (1×40) = 120 → capped at 100
```

### Recency Score (15%)

```
If last_activity < 1 day: 100
If last_activity < 7 days: 80
If last_activity < 30 days: 50
If last_activity < 90 days: 20
If last_activity > 90 days: 5
```

### Frequency Score (20%)

```
Points = (week_events × 15) + (month_events × 5)
- Events in last 7 days: 15 points each
- Events in last 30 days: 5 points each
Example: 3 this week + 10 this month = (3×15) + (10×5) = 95
```

### Behavior Score (10%)

```
Points by event type (max 100):
- Cart add: 25 points each
- Remove from cart: -15 points each
- Purchase: 100+ points
- Form submit: 20 points
Example: 2 adds + 1 purchase = (2×25) + 100 = 150 → capped at 100

Final Score = (Engagement × 0.2) + (Intent × 0.35) + (Recency × 0.15) + (Frequency × 0.2) + (Behavior × 0.1)
```

## Performance Considerations

### Database Indexes
```
- (company_id, temperature) - Fast hot lead queries
- (company_id, status) - Fast status filtering
- (unique_identifier, timestamp) - Event lookup
- (session_id) - Session replay
```

### Caching Strategy
```
Cache TTL: 5 minutes
- Lead analytics (scores, counts)
- Company configuration
- User roles and permissions

Invalidated on:
- New lead created
- Lead scored
- Recommendation created
```

### Batch Processing
```
Events: Sent in batches (max 10, or every 30 seconds)
Scoring: Runs every 30 minutes (scheduled task)
Recommendations: Generated during scoring
Reporting: Computed on-demand, cached
```

## Scalability Path

### Current (Development)
- Single Django server
- SQLite database
- In-memory event queue
- Manual scoring run

### Stage 1 (Small SaaS)
- Single Django server
- MySQL database
- Redis for caching
- Celery for scoring tasks

### Stage 2 (Growth)
- Multiple Django servers (load balanced)
- MySQL master-slave replication
- Redis cluster for caching
- Celery workers for scoring
- Elasticsearch for event search

### Stage 3 (Enterprise)
- Kubernetes for orchestration
- PostgreSQL with sharding by company_id
- Redis cluster
- Kafka for event streaming
- Separate analytics database
- Real-time dashboards with WebSockets

---

**Architecture Version**: 1.0
**Last Updated**: 2024-01-15
