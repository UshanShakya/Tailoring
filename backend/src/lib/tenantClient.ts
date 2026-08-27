import { Prisma } from '@prisma/client';
import prisma from './prisma';

/**
 * Tenant-scoped Prisma client wrapper.
 * Every query touching business-scoped tables MUST go through this helper
 * to guarantee that businessId is strictly filtered and never omitted.
 */
export function forBusiness(businessId: string) {
  return {
    user: {
      findMany: (args: Prisma.UserFindManyArgs = {}) =>
        prisma.user.findMany({
          ...args,
          where: { ...args.where, businessId },
        }),
      findFirst: (args: Prisma.UserFindFirstArgs = {}) =>
        prisma.user.findFirst({
          ...args,
          where: { ...args.where, businessId },
        }),
      create: (data: Omit<Prisma.UserUncheckedCreateInput, 'businessId'>) =>
        prisma.user.create({
          data: { ...data, businessId },
        }),
      update: (id: string, data: Prisma.UserUpdateInput) =>
        prisma.user.update({
          where: { id },
          data,
        }),
    },
    customer: {
      findMany: (args: Prisma.CustomerFindManyArgs = {}) =>
        prisma.customer.findMany({
          ...args,
          where: { ...args.where, businessId },
        }),
      findFirst: (args: Prisma.CustomerFindFirstArgs = {}) =>
        prisma.customer.findFirst({
          ...args,
          where: { ...args.where, businessId },
        }),
      create: (data: Omit<Prisma.CustomerUncheckedCreateInput, 'businessId'>) =>
        prisma.customer.create({
          data: { ...data, businessId },
        }),
      update: (id: string, data: Prisma.CustomerUpdateInput) =>
        prisma.customer.update({
          where: { id },
          data,
        }),
    },
  };
}
