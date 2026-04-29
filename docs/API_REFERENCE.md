# API Reference - Sales CRM System

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register New Company
```
POST /auth/register/
Content-Type: application/json

{
  "company_name": "Acme Corporation",
  "company_email": "contact@acme.com",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@acme.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}

Response: 201 Created
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john@acme.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "company": {
    "id": 1,
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "plan": "free"
  }
}
```

### Login
```
POST /auth/login/
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john@acme.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  },
  "company": {
    "id": 1,
    "name": "Acme Corporation",
    "plan": "free"
  }
}
```

### Get Current User
```
GET /auth/me/
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    "id": 1,
    "email": "john@acme.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  },
  "company": {
    "id": 1,
    "name": "Acme Corporation"
  }
}
```

### Change Password
```
POST /auth/change_password/
Authorization: Bearer {token}
Content-Type: application/json

{
  "old_password": "OldPass123",
  "new_password": "NewPass123",
  "new_password_confirm": "NewPass123"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

---

## Leads Endpoints

### List All Leads
```
GET /crm/leads/?temperature=hot&status=new&page=1
Authorization: Bearer {token}

Query Parameters:
- temperature: hot|warm|cold (optional)
- status: new|contacted|qualified|won|lost (optional)
- search: search by name, email (optional)
- ordering: -score|-last_seen|created_at (optional)
- page: page number (default: 1)

Response: 200 OK
{
  "count": 25,
  "next": "http://localhost:8000/api/crm/leads/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "unique_identifier": "user_1234567890",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "score": 85,
      "temperature": "hot",
      "temperature_display": "Hot",
      "status": "new",
      "status_display": "New",
      "total_visits": 5,
      "time_spent_seconds": 1200,
      "last_seen": "2024-01-15T10:30:00Z",
      "assigned_to_display": {
        "id": 2,
        "user_email": "john@acme.com",
        "user_first_name": "John",
        "user_last_name": "Doe",
        "role": "sales_rep"
      }
    }
  ]
}
```

### Get Lead Details
```
GET /crm/leads/{id}/
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "unique_identifier": "user_1234567890",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0100",
  "company_name": "Tech Corp",
  "score": 85,
  "temperature": "hot",
  "temperature_display": "Hot",
  "conversion_rate": 0.85,
  "status": "new",
  "status_display": "New",
  "assigned_to_display": {...},
  "total_visits": 5,
  "total_clicks": 23,
  "time_spent_seconds": 1200,
  "pages_visited": [
    "http://localhost:3001/",
    "http://localhost:3001/products",
    "http://localhost:3001/product/1"
  ],
  "first_seen": "2024-01-10T08:00:00Z",
  "last_seen": "2024-01-15T10:30:00Z",
  "last_activity": "2024-01-15T10:30:00Z",
  "days_since_first_seen": 5,
  "days_since_last_activity": 0,
  "events": [
    {
      "id": 1,
      "event_type": "page_view",
      "event_type_display": "Page View",
      "event_data": {...},
      "url": "http://localhost:3001/",
      "element_text": "",
      "page_depth": 1,
      "intent_signal": "neutral",
      "timestamp": "2024-01-10T08:00:00Z"
    }
  ],
  "score_history": [
    {
      "id": 1,
      "score": 50,
      "temperature": "warm",
      "contributing_events": 3,
      "timestamp": "2024-01-10T08:30:00Z"
    }
  ],
  "recommendations": [
    {
      "id": 1,
      "recommendation_type": "call",
      "recommendation_type_display": "Call Lead",
      "priority": "urgent",
      "priority_display": "Urgent",
      "title": "Call Hot Lead Immediately",
      "description": "Jane Smith is showing high purchase intent",
      "confidence_score": 0.95,
      "reasoning": "High intent signals with no recent outreach",
      "is_actioned": false,
      "generated_at": "2024-01-15T10:00:00Z",
      "expires_at": "2024-01-22T10:00:00Z"
    }
  ]
}
```

### Create Lead
```
POST /crm/leads/
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newlead@example.com",
  "phone": "+1-555-0102",
  "first_name": "John",
  "last_name": "Prospect",
  "company_name": "Prospect Inc",
  "status": "new"
}

Response: 201 Created
{
  "id": 2,
  "email": "newlead@example.com",
  ...
}
```

### Update Lead
```
PATCH /crm/leads/{id}/
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "contacted",
  "assigned_to": 2
}

Response: 200 OK
{...updated lead...}
```

### Get Analytics
```
GET /crm/leads/analytics/?timeframe=30
Authorization: Bearer {token}

Query Parameters:
- timeframe: days (default: 30)

Response: 200 OK
{
  "total_leads": 25,
  "hot_leads": 5,
  "warm_leads": 10,
  "cold_leads": 10,
  "new_leads_period": 8,
  "avg_score": 52.3,
  "avg_conversion_rate": 0.45,
  "total_visits": 250,
  "total_time_spent": 3600,
  "by_status": {
    "new": 8,
    "contacted": 5,
    "qualified": 7,
    "proposal": 3,
    "won": 2,
    "lost": 0
  }
}
```

### Assign Lead to Sales Rep
```
POST /crm/leads/{id}/assign/
Authorization: Bearer {token}
Content-Type: application/json

{
  "assigned_to_id": 2
}

Response: 200 OK
{...updated lead with assignment...}
```

### Update Lead Status
```
POST /crm/leads/{id}/update_status/
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "qualified"
}

Response: 200 OK
{...updated lead...}
```

---

## Events Endpoints

### Track Event (from SDK)
```
POST /crm/events/track/
Content-Type: application/json

{
  "unique_identifier": "user_abc123",
  "event_type": "add_to_cart",
  "event_data": {
    "product_id": 1,
    "product_name": "Laptop Pro",
    "price": 1299,
    "quantity": 1
  },
  "session_id": "session_xyz789",
  "url": "http://localhost:3001/product/1",
  "page_depth": 2
}

Response: 201 Created
{
  "id": 123,
  "event_type": "add_to_cart",
  "event_type_display": "Add to Cart",
  "event_data": {...},
  "url": "http://localhost:3001/product/1",
  "element_text": "",
  "page_depth": 2,
  "intent_signal": "high",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Event Types
- `page_view` - User viewed a page
- `click` - User clicked an element
- `scroll` - User scrolled
- `form_start` - User began filling form
- `form_submit` - User submitted form
- `add_to_cart` - Item added to shopping cart
- `remove_from_cart` - Item removed from cart
- `view_product` - Viewed product details
- `start_checkout` - Began checkout process
- `complete_purchase` - Completed purchase
- `time_spent` - Tracked time on page
- `custom` - Custom event

---

## Recommendations Endpoints

### Get Recommendations
```
GET /crm/recommendations/?is_actioned=false&priority=urgent
Authorization: Bearer {token}

Query Parameters:
- is_actioned: true|false (optional)
- priority: urgent|high|medium|low (optional)
- page: page number (default: 1)

Response: 200 OK
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "recommendation_type": "call",
      "recommendation_type_display": "Call Lead",
      "priority": "urgent",
      "priority_display": "Urgent",
      "title": "Call Hot Lead Immediately",
      "description": "Jane Smith is showing high purchase intent",
      "confidence_score": 0.95,
      "reasoning": "High intent signals with no recent outreach",
      "is_actioned": false,
      "assigned_to_display": null,
      "generated_at": "2024-01-15T10:00:00Z",
      "expires_at": "2024-01-22T10:00:00Z"
    }
  ]
}
```

### Mark Recommendation as Actioned
```
POST /crm/recommendations/{id}/action/
Authorization: Bearer {token}
Content-Type: application/json

{
  "action_notes": "Called customer - Very interested, scheduled demo next week"
}

Response: 200 OK
{
  "id": 1,
  "is_actioned": true,
  "actioned_at": "2024-01-15T11:00:00Z",
  "action_notes": "Called customer - Very interested, scheduled demo next week",
  ...
}
```

### Dismiss Recommendation
```
POST /crm/recommendations/{id}/dismiss/
Authorization: Bearer {token}

Response: 200 OK
{
  "status": "dismissed"
}
```

---

## Company Users Endpoints

### List Company Users
```
GET /auth/users/
Authorization: Bearer {token}

Response: 200 OK
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "user_email": "john@acme.com",
      "user_first_name": "John",
      "user_last_name": "Doe",
      "role": "admin",
      "is_active": true,
      "department": "Sales",
      "phone": "+1-555-0100",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Invite User to Company
```
POST /auth/users/invite_user/
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@acme.com",
  "role": "sales_rep"
}

Response: 201 Created
{
  "id": 2,
  "user_email": "newuser@acme.com",
  "role": "sales_rep",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "another_field": ["Another error"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

---

## Rate Limiting

Default rate limits per authenticated user:
- 1000 requests per hour
- 100 concurrent requests

Contact support for higher limits.

---

## Pagination

List endpoints return paginated results:
```
{
  "count": 100,
  "next": "http://localhost:8000/api/crm/leads/?page=2",
  "previous": null,
  "results": [...]
}
```

Default page size: 20 items
Maximum page size: 100 items

---

## Filtering & Searching

### Filtering
Use query parameters to filter:
```
/crm/leads/?temperature=hot&status=contacted
```

### Searching
Use `search` parameter:
```
/crm/leads/?search=john@example.com
```

### Ordering
Use `ordering` parameter (prefix with `-` for descending):
```
/crm/leads/?ordering=-score
/crm/leads/?ordering=created_at
```

---

## Webhook Events (Future)

Planned webhook events:
- `lead.created` - New lead created
- `lead.scored` - Lead score updated
- `recommendation.generated` - New recommendation
- `purchase.completed` - Purchase completed

---

## Rate Limiting & Throttling

API endpoints are rate limited per authenticated user:
- Standard: 1000 requests/hour
- Events tracking: 10000 requests/hour
- Analytics: 100 requests/hour

---

**API Version**: 1.0.0
**Last Updated**: 2024-01-15
