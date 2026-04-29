# Development Guide

## Environment Variables

### Backend (.env)
```
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
# DB_ENGINE=django.db.backends.mysql
# DB_NAME=crm_db
# DB_USER=root
# DB_PASSWORD=password
# DB_HOST=localhost
# DB_PORT=3306

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
```

### E-commerce Demo (.env)
```
REACT_APP_TRACKING_SDK_URL=http://localhost:3002/tracking-sdk.js
REACT_APP_API_URL=http://localhost:8000/api
```

## Project Commands

### Backend

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run development server
python manage.py runserver

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Run scoring engine
python scoring_engine.py

# Run with auto-reload
python manage.py runserver --reload

# Clear database cache
python manage.py clear_cache
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (irreversible)
npm eject
```

### Tracking SDK

```bash
# Build minified version
npm run build

# Development with watch mode
npm run dev
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create serializer** in `app/serializers.py`
```python
class MyResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyResource
        fields = ['id', 'name', 'created_at']
```

2. **Create viewset** in `app/views.py`
```python
class MyResourceViewSet(viewsets.ModelViewSet):
    queryset = MyResource.objects.all()
    serializer_class = MyResourceSerializer
    permission_classes = [IsAuthenticated]
```

3. **Register in router** in `app/urls.py`
```python
router.register(r'resources', MyResourceViewSet, basename='resource')
```

### Adding a Frontend Component

1. **Create component** in `src/components/`
```javascript
const MyComponent = ({ data }) => {
  return <div>{data.name}</div>;
};
export default MyComponent;
```

2. **Use in page**
```javascript
import MyComponent from '../components/MyComponent';

const MyPage = () => {
  return <MyComponent data={data} />;
};
```

### Debugging

**Backend**
```python
# In views.py or models.py
import logging
logger = logging.getLogger(__name__)

logger.info(f"Debug message: {value}")
logger.error(f"Error occurred: {error}")

# or use debugging breakpoint
import pdb; pdb.set_trace()
```

**Frontend**
```javascript
// Console logging
console.log('Value:', value);
console.error('Error:', error);

// React DevTools browser extension
// Search for "React DevTools" in your extension store
```

## Testing

### Backend Testing

```bash
python manage.py test

# Run specific test
python manage.py test accounts.tests.RegisterTestCase

# With verbose output
python manage.py test --verbosity=2

# Run only models tests
python manage.py test --pattern="test_models.py"
```

### Frontend Testing

```bash
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Database Queries

### Direct Shell Queries

```bash
python manage.py shell

# In shell:
from accounts.models import Company
companies = Company.objects.all()
company = Company.objects.get(id=1)
company.name = "New Name"
company.save()
```

### Generate DB Diagram
```bash
# Install django-extensions
pip install django-extensions

# Generate models diagram
python manage.py graph_models -a -o models.png
```

## Performance Profiling

### Backend

```python
# Add to settings.py for profiling
MIDDLEWARE += [
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
]

# Use django-silk for profiling
pip install django-silk
```

### Frontend

```javascript
// React Profiler
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## Deployment Checklist

- [ ] Set DEBUG=False
- [ ] Update SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up HTTPS/TLS
- [ ] Use strong database password
- [ ] Create database backups
- [ ] Run migrations
- [ ] Collect static files
- [ ] Set up error logging
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and alerts
- [ ] Use environment variables for secrets
- [ ] Test all critical flows
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database indexes

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Use different port
python manage.py runserver 8001
```

### Database Lock

```bash
# SQLite shows database is locked
# Solution: Close all connections and delete .db-wal files

rm db.sqlite3-wal
rm db.sqlite3-shm
```

### CORS Issues

```python
# Add to settings.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
```

### Node Modules Issues

```bash
# Remove and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

## Understanding the Codebase

### Backend Structure
- `config/` - Django project settings
- `accounts/` - Authentication and company management
- `crm/` - Core CRM models and APIs
- `core/` - Shared utilities (auth, middleware, base models)

### Frontend Structure
- `pages/` - Full page components
- `components/` - Reusable components
- `services/` - API integration
- `context/` - State management

### Key Files
- `backend/scoring_engine.py` - AI scoring logic
- `tracking-sdk/src/tracking-sdk.js` - Event tracking
- `frontend/src/context/AuthContext.js` - Auth state
- `ecommerce-demo/src/context/CartContext.js` - Cart state

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Review and merge
```

## Code Style

### Python (PEP 8)
- 4 spaces indentation
- Max line length: 79 characters
- Use descriptive variable names
- Add docstrings to functions

### JavaScript (Prettier)
- 2 spaces indentation
- Semicolons required
- Single quotes for strings
- Arrow functions preferred

### CSS (Tailwind)
- Use Tailwind utility classes
- Avoid custom CSS when possible
- Mobile-first responsive design

---

**Last Updated**: 2024-01-15
