import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { requireAuth, canAccessTicket } from '../../utils/auth';

export const resolvers = {
  Query: {
    comments: async (_: any, args: { ticketId: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const ticket = await canAccessTicket(args.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      const where: any = { ticketId: args.ticketId };
      
      if (authenticatedUser.role === 'CUSTOMER') {
        where.isInternal = false;
      }

      return prisma.comment.findMany({
        where,
        include: { user: true, ticket: true },
        orderBy: { createdAt: 'asc' },
      });
    },

    comment: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const comment = await prisma.comment.findUnique({
        where: { id: args.id },
        include: { user: true, ticket: true },
      });

      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      const ticket = await canAccessTicket(comment.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied');
      }

      if (authenticatedUser.role === 'CUSTOMER' && comment.isInternal) {
        throw new ForbiddenError('Access denied');
      }

      return comment;
    },
  },

  Mutation: {
    createComment: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const { ticketId, content, isInternal = false } = args.data;

      if (!content?.trim()) {
        throw new UserInputError('Comment content is required');
      }

      const ticket = await canAccessTicket(ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      if (authenticatedUser.role === 'CUSTOMER' && isInternal) {
        throw new ForbiddenError('Customers cannot create internal comments');
      }

      try {
        const comment = await prisma.comment.create({
          data: {
            ticketId,
            userId: authenticatedUser.id,
            content: content.trim(),
            isInternal: authenticatedUser.role === 'CUSTOMER' ? false : isInternal,
          },
          include: { user: true, ticket: true },
        });

        await prisma.history.create({
          data: {
            ticketId,
            userId: authenticatedUser.id,
            type: 'COMMENT',
            message: `${isInternal ? 'Internal c' : 'C'}omment added by ${authenticatedUser.name}`,
          },
        });

        return comment;
      } catch (error) {
        console.error('Error creating comment:', error);
        throw new Error('Failed to create comment');
      }
    },

    updateComment: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const comment = await prisma.comment.findUnique({
        where: { id: args.id },
        include: { user: true, ticket: true },
      });

      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (comment.userId !== authenticatedUser.id && authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only edit your own comments');
      }

      const ticket = await canAccessTicket(comment.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied');
      }

      const { content, isInternal } = args.data;
      const updateData: any = {};

      if (content !== undefined) {
        if (!content.trim()) {
          throw new UserInputError('Comment content cannot be empty');
        }
        updateData.content = content.trim();
      }

      if (isInternal !== undefined) {
        if (authenticatedUser.role === 'CUSTOMER' && isInternal) {
          throw new ForbiddenError('Customers cannot create internal comments');
        }
        updateData.isInternal = isInternal;
      }

      try {
        return prisma.comment.update({
          where: { id: args.id },
          data: updateData,
          include: { user: true, ticket: true },
        });
      } catch (error) {
        console.error('Error updating comment:', error);
        throw new Error('Failed to update comment');
      }
    },

    deleteComment: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const comment = await prisma.comment.findUnique({
        where: { id: args.id },
        include: { user: true, ticket: true },
      });

      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (comment.userId !== authenticatedUser.id && authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only delete your own comments');
      }

      const ticket = await canAccessTicket(comment.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied');
      }

      try {
        return prisma.comment.delete({
          where: { id: args.id },
          include: { user: true, ticket: true },
        });
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw new Error('Failed to delete comment');
      }
    },
  },

  Comment: {
    ticket: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.ticket) return parent.ticket;
      return prisma.ticket.findUnique({ where: { id: parent.ticketId } });
    },
    
    user: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.user) return parent.user;
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};