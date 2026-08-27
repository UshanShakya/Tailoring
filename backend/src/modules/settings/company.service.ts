import { z } from 'zod';
import prisma from '../../lib/prisma';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary';

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required').optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  panNumber: z.string().optional().nullable(),
  isVatRegistered: z.boolean().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  invoiceNote: z.string().optional().nullable(),
});

// Fetch Business Company Billing Profile
export async function getCompanySettings(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      panNumber: true,
      isVatRegistered: true,
      taxRate: true,
      logoUrl: true,
      logoPublicId: true,
      invoiceNote: true,
      createdAt: true,
    },
  });

  if (!business) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Business profile not found' };
  }

  return {
    ...business,
    taxRate: Number(business.taxRate || 0),
  };
}

// Update Business Company Billing Settings
export async function updateCompanySettings(
  businessId: string,
  input: z.infer<typeof updateCompanySchema>
) {
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: input.name,
      address: input.address,
      phone: input.phone,
      email: input.email || null,
      panNumber: input.panNumber,
      isVatRegistered: input.isVatRegistered,
      taxRate: input.taxRate !== undefined ? input.taxRate : undefined,
      invoiceNote: input.invoiceNote,
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      panNumber: true,
      isVatRegistered: true,
      taxRate: true,
      logoUrl: true,
      logoPublicId: true,
      invoiceNote: true,
    },
  });

  return {
    ...updated,
    taxRate: Number(updated.taxRate || 0),
  };
}

// Upload & Update Company Logo
export async function uploadCompanyLogo(businessId: string, fileBase64: string) {
  const current = await prisma.business.findUnique({
    where: { id: businessId },
    select: { logoPublicId: true },
  });

  // Delete previous logo if exists
  if (current?.logoPublicId) {
    await deleteImageFromCloudinary(current.logoPublicId);
  }

  const { url, publicId } = await uploadImageToCloudinary(fileBase64, 'tailoring_logos');

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      logoUrl: url,
      logoPublicId: publicId,
    },
    select: {
      id: true,
      logoUrl: true,
      logoPublicId: true,
    },
  });

  return updated;
}

// Remove Company Logo
export async function removeCompanyLogo(businessId: string) {
  const current = await prisma.business.findUnique({
    where: { id: businessId },
    select: { logoPublicId: true },
  });

  if (current?.logoPublicId) {
    await deleteImageFromCloudinary(current.logoPublicId);
  }

  return prisma.business.update({
    where: { id: businessId },
    data: {
      logoUrl: null,
      logoPublicId: null,
    },
    select: {
      id: true,
      logoUrl: true,
      logoPublicId: true,
    },
  });
}
