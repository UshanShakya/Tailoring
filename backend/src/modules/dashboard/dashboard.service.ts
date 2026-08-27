import prisma from '../../lib/prisma';

export async function getDashboardStats(businessId: string | null) {
  const whereTenant = businessId ? { businessId } : {};

  // 1. Total Customers
  const totalCustomers = await prisma.customer.count({
    where: whereTenant,
  });

  // 2. Active Orders in Production (CONFIRMED, IN_PROGRESS, READY)
  const activeOrdersCount = await prisma.order.count({
    where: {
      ...whereTenant,
      status: { in: ['CONFIRMED', 'IN_PROGRESS', 'READY'] },
    },
  });

  // 3. Financial Stats (Total Revenue Collected & Total Outstanding Due)
  const invoices = await prisma.invoice.findMany({
    where: whereTenant,
    select: {
      totalAmount: true,
      paidAmount: true,
      dueAmount: true,
    },
  });

  let totalRevenue = 0;
  let outstandingDue = 0;

  for (const inv of invoices) {
    totalRevenue += Number(inv.paidAmount || 0);
    outstandingDue += Number(inv.dueAmount || 0);
  }

  // 4. Recent Audit Logs (Last 10 events)
  const recentAuditLogs = await prisma.auditLog.findMany({
    where: whereTenant,
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    totalCustomers,
    activeOrdersCount,
    totalRevenue,
    outstandingDue,
    recentAuditLogs,
  };
}
