import { z } from 'zod';
import prisma from '../../lib/prisma';
import { forBusiness } from '../../lib/tenantClient';

export const createMeasurementSchema = z.object({
  templateId: z.string().min(1, 'Measurement template ID is required'),
  values: z.record(z.union([z.number(), z.string()])),
  notes: z.string().optional(),
});

// List Customer Measurements (sorted by version descending)
export async function listCustomerMeasurements(businessId: string, customerId: string) {
  // Ensure customer belongs to business
  await forBusiness(businessId).customer.findFirst({
    where: { id: customerId },
  });

  return prisma.measurement.findMany({
    where: {
      businessId,
      customerId,
    },
    include: {
      template: {
        include: {
          garmentType: true,
          fields: { orderBy: { order: 'asc' } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get Single Measurement Record
export async function getMeasurementById(businessId: string, measurementId: string) {
  const measurement = await prisma.measurement.findFirst({
    where: { id: measurementId, businessId },
    include: {
      customer: true,
      template: {
        include: {
          garmentType: true,
          fields: { orderBy: { order: 'asc' } },
        },
      },
    },
  });

  if (!measurement) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Measurement record not found' };
  }

  return measurement;
}

// Create New Measurement (Auto-increments version per template/customer)
export async function createMeasurement(
  businessId: string,
  customerId: string,
  takenBy: string,
  input: z.infer<typeof createMeasurementSchema>
) {
  // Verify customer belongs to business
  const customer = await forBusiness(businessId).customer.findFirst({
    where: { id: customerId },
  });

  if (!customer) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Customer record not found' };
  }

  // Find template definition
  const template = await prisma.measurementTemplate.findFirst({
    where: {
      id: input.templateId,
      OR: [{ businessId: null }, { businessId }],
    },
    include: { fields: true },
  });

  if (!template) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Template not found' };
  }

  // Compute next version
  const lastMeasurement = await prisma.measurement.findFirst({
    where: {
      businessId,
      customerId,
      templateId: input.templateId,
    },
    orderBy: { version: 'desc' },
  });

  const nextVersion = lastMeasurement ? lastMeasurement.version + 1 : 1;

  return prisma.measurement.create({
    data: {
      businessId,
      customerId,
      templateId: input.templateId,
      version: nextVersion,
      values: input.values,
      notes: input.notes,
      takenBy,
    },
    include: {
      template: {
        include: {
          garmentType: true,
          fields: { orderBy: { order: 'asc' } },
        },
      },
    },
  });
}
