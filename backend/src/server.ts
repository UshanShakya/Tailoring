import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import businessesRoutes from './modules/businesses/businesses.routes';
import rolesRoutes from './modules/roles/roles.routes';
import customersRoutes from './modules/customers/customers.routes';
import templatesRoutes from './modules/templates/templates.routes';
import { adminUsersRouter, tenantUsersRouter } from './modules/users/users.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/auth', authRoutes);
app.use('/admin/businesses', businessesRoutes);
app.use('/admin/users', adminUsersRouter);
app.use('/users', tenantUsersRouter);
app.use('/roles', rolesRoutes);
app.use('/customers', customersRoutes);
app.use('/', templatesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback error handler
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.listen(PORT, () => {
  console.log(`[Tailoring API Server] listening on http://localhost:${PORT}`);
});
