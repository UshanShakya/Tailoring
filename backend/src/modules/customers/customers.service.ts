import { z } from 'zod';
import { forBusiness } from '../../lib/tenantClient';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// List customers for caller's business with 3-field search filter (Name, Phone, Address)
export async function listCustomers(businessId: string, search?: string) {
  const where: any = {};
  if (search && search.trim() !== '') {
    const query = search.trim();
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
    ];
  }

  return forBusiness(businessId).customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

// Get single customer profile by ID
export async function getCustomerById(businessId: string, customerId: string) {
  const customer = await forBusiness(businessId).customer.findFirst({
    where: { id: customerId },
  });

  if (!customer) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Customer record not found' };
  }

  return customer;
}

// Create new customer record
export async function createCustomer(
  businessId: string,
  createdBy: string,
  input: z.infer<typeof createCustomerSchema>
) {
  return forBusiness(businessId).customer.create({
    name: input.name,
    phone: input.phone,
    address: input.address,
    notes: input.notes,
    createdBy,
  });
}

// Update existing customer record
export async function updateCustomer(
  businessId: string,
  customerId: string,
  input: z.infer<typeof updateCustomerSchema>
) {
  await getCustomerById(businessId, customerId);

  return forBusiness(businessId).customer.update(customerId, input);
}
