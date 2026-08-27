# Supabase Free Tier Setup Guide (Modern Supavisor & Prisma Method)

This guide walks you through setting up a free-tier PostgreSQL database on Supabase using the modern **Supavisor connection pooling** method required for Node.js + Express + Prisma applications.

---

## 1. Create a Free Supabase Account

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** or **Sign Up**.
2. Sign in using GitHub or your email.

---

## 2. Create a New Project

1. Click **New Project**.
2. Select or create an **Organization**.
3. Fill in the project details:
   - **Name**: `tailoring-platform` (or your preferred name)
   - **Database Password**: Generate or set a strong password. **Save this password safely** — you will need it for the connection string!
   - **Region**: Choose the region closest to you or your users.
   - **Pricing Plan**: Select **Free Tier** ($0/month).
4. Click **Create new project** and wait ~1-2 minutes for Supabase to provision your database.

---

## 3. Retrieve Modern Connection Strings (Prisma Setup)

Modern Supabase uses **Supavisor** for connection pooling and requires two URLs for Prisma:
1. `DATABASE_URL`: Transaction-pooled connection string (used by Express server at runtime).
2. `DIRECT_URL`: Direct database connection string (used by Prisma CLI for migrations & schema sync).

### Steps to get the connection strings:

1. In your Supabase dashboard, click the **Settings** icon (gear icon at bottom left) $\rightarrow$ **Database**.
2. Scroll to the **Connection string** section.
3. Select the **Prisma** tab (or **Connection pooler** tab):

#### A. Pooled Connection (`DATABASE_URL`)
- Mode: **Transaction** (Port `6543`)
- URI format:
  ```env
  DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
  ```

#### B. Direct Connection (`DIRECT_URL`)
- Mode: **Session / Direct** (Port `5432`)
- URI format:
  ```env
  DIRECT_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
  ```

> 💡 **Note**: Replace `[PROJECT-REF]`, `[PASSWORD]`, and `[REGION]` with your actual Supabase credentials.

---

## 4. Configure `backend/.env`

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
NODE_ENV=development

# Modern Supabase + Prisma Connection Strings
DATABASE_URL="postgres://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Authentication Secrets
JWT_ACCESS_SECRET="your-super-secret-access-token-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-change-this"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

---

## 5. Modern Prisma Schema Configuration (`schema.prisma`)

In the `backend/prisma/schema.prisma` file, configure the datasource block to use both `url` and `directUrl`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## 6. Testing & Running Migrations

Once your `.env` is saved:
1. Run initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Verify connection by running the seed script or inspecting tables in the Supabase Dashboard under **Table Editor**.
