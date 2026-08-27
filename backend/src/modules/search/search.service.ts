import prisma from '../../lib/prisma';
import { forBusiness } from '../../lib/tenantClient';

export interface SearchResultCategory {
  category: 'Customers' | 'Orders' | 'Invoices' | 'Templates' | 'Businesses';
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    link: string;
  }>;
}

export async function performGlobalSearch(
  businessId: string | null,
  userRoleName?: string,
  userPermissions: string[] = [],
  query: string = ''
) {
  const q = query.trim();
  if (!q || q.length < 2) {
    return [];
  }

  const isSuperAdmin = userRoleName === 'Super Admin';
  const whereTenant = businessId ? { businessId } : {};

  const results: SearchResultCategory[] = [];

  // Helper check permissions
  const canAccess = (permKey: string) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes('*') || userPermissions.includes(permKey) || userPermissions.includes('menu:*');
  };

  // 1. Search Customers
  if (canAccess('menu:customers') || canAccess('customer:view')) {
    const customers = await prisma.customer.findMany({
      where: {
        ...whereTenant,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    if (customers.length > 0) {
      results.push({
        category: 'Customers',
        items: customers.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: [c.phone, c.address].filter(Boolean).join(' • ') || 'Client record',
          link: `/dashboard/customers/${c.id}`,
        })),
      });
    }
  }

  // 2. Search Orders
  if (canAccess('menu:orders') || canAccess('order:view')) {
    const orders = await prisma.order.findMany({
      where: {
        ...whereTenant,
        OR: [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customer: { name: { contains: q, mode: 'insensitive' } } },
          { customer: { phone: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { customer: true },
      take: 5,
    });

    if (orders.length > 0) {
      results.push({
        category: 'Orders',
        items: orders.map((o) => ({
          id: o.id,
          title: o.orderNumber,
          subtitle: `Client: ${o.customer?.name || 'Unknown'}`,
          badge: o.status,
          link: `/dashboard/orders/${o.id}`,
        })),
      });
    }
  }

  // 3. Search Invoices
  if (canAccess('menu:invoices') || canAccess('invoice:view')) {
    const invoices = await prisma.invoice.findMany({
      where: {
        ...whereTenant,
        OR: [
          { invoiceNumber: { contains: q, mode: 'insensitive' } },
          { order: { orderNumber: { contains: q, mode: 'insensitive' } } },
          { customer: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { customer: true },
      take: 5,
    });

    if (invoices.length > 0) {
      results.push({
        category: 'Invoices',
        items: invoices.map((inv) => ({
          id: inv.id,
          title: inv.invoiceNumber,
          subtitle: `Client: ${inv.customer?.name || 'Unknown'}`,
          badge: inv.status,
          link: `/dashboard/invoices/${inv.id}`,
        })),
      });
    }
  }

  // 4. Search Garment Templates
  if (canAccess('menu:templates') || canAccess('template:view')) {
    const templates = await prisma.measurementTemplate.findMany({
      where: {
        OR: [
          { businessId: businessId || undefined },
          { isSystemDefault: true },
        ],
        AND: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nameNp: { contains: q, mode: 'insensitive' } },
          ],
        },
      },
      take: 5,
    });

    if (templates.length > 0) {
      results.push({
        category: 'Templates',
        items: templates.map((t) => ({
          id: t.id,
          title: t.name,
          subtitle: t.nameNp ? `Nepali: ${t.nameNp}` : 'Measurement template',
          link: `/dashboard/templates`,
        })),
      });
    }
  }

  // 5. Search Businesses (Super Admin Only)
  if (isSuperAdmin) {
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    if (businesses.length > 0) {
      results.push({
        category: 'Businesses',
        items: businesses.map((b) => ({
          id: b.id,
          title: b.name,
          subtitle: [b.phone, b.address].filter(Boolean).join(' • ') || 'Tenant Business',
          badge: b.isActive ? 'Active' : 'Inactive',
          link: `/dashboard/admin/businesses`,
        })),
      });
    }
  }

  return results;
}
