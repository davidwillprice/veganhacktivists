import { TRPCError } from '@trpc/server';

import {
  getPlaygroundRequests,
  getRequestById,
  submitRequest,
} from 'lib/services/playground';
import {
  getPlaygroundRequestsSchema,
  getRequestByIdSchema,
  submitRequestSchema,
} from 'lib/services/playground/schemas';
import { protectedProcedure } from 'server/procedures/auth';
import { t } from 'server/trpc';

const requestsRouter = t.router({
  getAllRequests: t.procedure
    .input(getPlaygroundRequestsSchema)
    .query(async ({ input }) => {
      return await getPlaygroundRequests(input);
    }),
  getRequest: t.procedure
    .input(getRequestByIdSchema)
    .query(({ input, ctx: { user } }) => {
      try {
        return getRequestById(input, user);
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }
    }),

  // auth procedures
  submitRequest: protectedProcedure
    .input(submitRequestSchema)
    .mutation(({ input, ctx }) => {
      return submitRequest({
        ...input,
        requesterId: ctx.user.id,
      });
    }),
  getLastUserRequest: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      const request = await prisma.playgroundRequest.findFirst({
        where: {
          requesterId: user.id,
        },
        select: {
          name: true,
          organization: true,
          calendlyUrl: true,
          phone: true,
          providedEmail: true,
          website: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return request;
    }
  ),
});

export default requestsRouter;
