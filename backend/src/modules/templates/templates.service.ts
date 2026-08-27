import { z } from 'zod';
import prisma from '../../lib/prisma';

export const createGarmentTypeSchema = z.object({
  name: z.string().min(2, 'Garment type name is required'),
  nameNp: z.string().optional(),
});

export const fieldSchema = z.object({
  label: z.string().min(1, 'English label is required'),
  labelNp: z.string().optional(),
  key: z.string().min(1, 'Field key is required'),
  unit: z.string().default('in'),
  dataType: z.enum(['number', 'text']).default('number'),
  order: z.number().default(1),
  required: z.boolean().default(true),
});

export const createTemplateSchema = z.object({
  garmentTypeId: z.string().uuid('Invalid garment type ID'),
  name: z.string().min(2, 'Template name is required'),
  nameNp: z.string().optional(),
  fields: z.array(fieldSchema).min(1, 'At least one measurement field is required'),
});

export const cloneTemplateSchema = z.object({
  templateId: z.string().min(1, 'Source template ID is required'),
  name: z.string().optional(),
  nameNp: z.string().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  nameNp: z.string().optional(),
  fields: z.array(fieldSchema).optional(),
});

// List Garment Types (System Defaults + Business-Owned)
export async function listGarmentTypes(businessId: string | null) {
  return prisma.garmentType.findMany({
    where: {
      OR: [
        { businessId: null },
        ...(businessId ? [{ businessId }] : []),
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { templates: true } },
    },
  });
}

// Create Custom Garment Type
export async function createGarmentType(businessId: string | null, input: z.infer<typeof createGarmentTypeSchema>) {
  return prisma.garmentType.create({
    data: {
      name: input.name,
      nameNp: input.nameNp,
      businessId,
      isSystemDefault: false,
    },
  });
}

// List Measurement Templates (Merged System Defaults & Tenant Copies)
export async function listTemplates(businessId: string | null) {
  const templates = await prisma.measurementTemplate.findMany({
    where: {
      OR: [
        { businessId: null },
        ...(businessId ? [{ businessId }] : []),
      ],
    },
    include: {
      garmentType: true,
      fields: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return templates;
}

// Get Single Template by ID
export async function getTemplateById(businessId: string | null, templateId: string) {
  const template = await prisma.measurementTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        { businessId: null },
        ...(businessId ? [{ businessId }] : []),
      ],
    },
    include: {
      garmentType: true,
      fields: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!template) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Measurement template not found' };
  }

  return template;
}

// Clone a System Template into a Business-Owned Copy for Editing
export async function cloneTemplate(
  businessId: string,
  sourceTemplateId: string,
  customName?: string,
  customNameNp?: string
) {
  const source = await prisma.measurementTemplate.findUnique({
    where: { id: sourceTemplateId },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  if (!source) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Source template not found' };
  }

  const name = customName || `${source.name} (Custom)`;
  const nameNp = customNameNp || (source.nameNp ? `${source.nameNp} (अनुकूलित)` : undefined);

  return prisma.measurementTemplate.create({
    data: {
      businessId,
      garmentTypeId: source.garmentTypeId,
      name,
      nameNp,
      isSystemDefault: false,
      fields: {
        create: source.fields.map((f) => ({
          label: f.label,
          labelNp: f.labelNp,
          key: f.key,
          unit: f.unit,
          dataType: f.dataType,
          order: f.order,
          required: f.required,
        })),
      },
    },
    include: {
      garmentType: true,
      fields: { orderBy: { order: 'asc' } },
    },
  });
}

// Create Brand New Custom Template
export async function createCustomTemplate(businessId: string, input: z.infer<typeof createTemplateSchema>) {
  return prisma.measurementTemplate.create({
    data: {
      businessId,
      garmentTypeId: input.garmentTypeId,
      name: input.name,
      nameNp: input.nameNp,
      isSystemDefault: false,
      fields: {
        create: input.fields.map((f, idx) => ({
          label: f.label,
          labelNp: f.labelNp,
          key: f.key || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          unit: f.unit || 'in',
          dataType: f.dataType || 'number',
          order: f.order || idx + 1,
          required: f.required ?? true,
        })),
      },
    },
    include: {
      garmentType: true,
      fields: { orderBy: { order: 'asc' } },
    },
  });
}

// Update Business-Owned Template Fields and Labels
export async function updateTemplate(
  businessId: string,
  templateId: string,
  input: z.infer<typeof updateTemplateSchema>
) {
  const template = await prisma.measurementTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Template not found' };
  }

  if (template.isSystemDefault) {
    throw {
      status: 400,
      code: 'FORBIDDEN',
      message: 'System default templates cannot be edited directly. Please clone it into a custom copy first!',
    };
  }

  if (template.businessId !== businessId) {
    throw { status: 403, code: 'FORBIDDEN', message: 'Cannot edit templates belonging to another business' };
  }

  // Update Template & Fields in transaction
  return prisma.$transaction(async (tx) => {
    if (input.fields) {
      // Replace fields
      await tx.templateField.deleteMany({ where: { templateId } });
      await tx.templateField.createMany({
        data: input.fields.map((f, idx) => ({
          templateId,
          label: f.label,
          labelNp: f.labelNp,
          key: f.key || f.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          unit: f.unit || 'in',
          dataType: f.dataType || 'number',
          order: f.order || idx + 1,
          required: f.required ?? true,
        })),
      });
    }

    return tx.measurementTemplate.update({
      where: { id: templateId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.nameNp !== undefined ? { nameNp: input.nameNp } : {}),
      },
      include: {
        garmentType: true,
        fields: { orderBy: { order: 'asc' } },
      },
    });
  });
}
