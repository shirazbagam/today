# AJKMart - Professional Development Guide

## Initial Setup

```bash
# Install all dependencies and create .env file
pnpm setup
```

This will:
- ✅ Install all dependencies
- ✅ Create `.env` file from `.env.example`
- ✅ Be ready to configure environment variables

**Important:** Edit `.env` and set `DATABASE_URL` before running services.

---

## Running Services

Each service runs independently with its own command. Open separate terminals for each:

### 1. Backend API Server
```bash
pnpm api:dev
```
- 📍 Runs on: `http://localhost:3000`
- API endpoints available at: `http://localhost:3000/api`
- Requires: `DATABASE_URL` in `.env`

### 2. Admin Panel
```bash
pnpm admin:dev
```
- 📍 Runs on: `http://localhost:5179`
- Web-based admin dashboard
- Built with: React + Vite + Tailwind

### 3. Rider App
```bash
pnpm rider:dev
```
- 📍 Runs on: `http://localhost:5180`
- Delivery rider management interface
- Built with: React + Vite + Capacitor

### 4. Vendor App
```bash
pnpm vendor:dev
```
- 📍 Runs on: `http://localhost:5181`
- Shop/vendor management dashboard
- Built with: React + Vite + Capacitor

### 5. Customer App (AJKMart)
```bash
pnpm ajkmart:dev
```
- 📍 Runs on: `http://localhost:8081`
- Customer-facing mobile app
- Built with: React Native + Expo

---

## Database Setup

Initialize and migrate database:
```bash
pnpm db:migrate
```

This runs the build process which handles database setup.

---

## Services Ports Reference

| Service | Port | URL |
|---------|------|-----|
| API Server | 3000 | http://localhost:3000 |
| Rider App | 5180 | http://localhost:5180 |
| Admin Panel | 5179 | http://localhost:5179 |
| Vendor App | 5181 | http://localhost:5181 |
| Customer App | 8081 | http://localhost:8081 |

---

## Development Workflow

### Monorepo Structure
```
workspace/
├── artifacts/
│   ├── api-server/     ← Backend (Node.js + Express)
│   ├── admin/          ← Admin Panel (React)
│   ├── rider-app/      ← Rider App (React + Capacitor)
│   ├── vendor-app/     ← Vendor App (React + Capacitor)
│   └── ajkmart/        ← Customer App (React Native + Expo)
├── lib/
│   ├── db/             ← Database schema & migrations
│   ├── api-client-react/ ← Shared API client hooks
│   ├── auth-utils/     ← Authentication helpers
│   ├── i18n/           ← Translations (Urdu/English)
│   └── service-constants/ ← Shared constants
└── pnpm-workspace.yaml
```

### Type Checking
```bash
pnpm typecheck
# Check specific library
pnpm typecheck:libs
```

### Building for Production
```bash
pnpm build
```

---

## Environment Variables (.env)

Required variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ajkmart
ADMIN_SECRET=your-secure-secret-key
VITE_API_URL=http://localhost:3000/api
EXPO_PUBLIC_DOMAIN=http://localhost:3000
PORT=3000
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port (e.g., 3000)
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Connection Error
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database exists and is accessible

---

## Notes

- Use `pnpm` for all commands (required for monorepo)
- Run each service in a separate terminal
- All services must have API running to function properly
- Hot reload is enabled for development
