import { Prisma } from 'src/generated/prisma/client';

export type OrderWithDetails = Prisma.OrderLogGetPayload<{
  include: {
    cart: {
      include: {
        articles: {
          include: {
            article: {
              include: {
                category: true;
                articlePrices: {
                  orderBy: [{ createdAt: 'desc' }, { articlePriceId: 'desc' }];
                  take: 1;
                };
              };
            };
          };
        };
        user: {
          omit: { isActive: true; passwordHash: true; deletedAt: true };
        };
      };
    };
  };
}>;
