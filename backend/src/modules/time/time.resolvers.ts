import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { requireAuth, canAccessTicket, calculateDuration } from '../../utils/auth';

export const resolvers = {
  Query: {
    timeEntries: async (_: any, args: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const { filters = {}, limit = 50, offset = 0 } = args;
      const where: any = {};

      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot view time entries');
      }

      if (authenticatedUser.role === 'EMPLOYEE') {
        where.userId = authenticatedUser.id;
      }

      if (filters.userId && authenticatedUser.role === 'ADMIN') {
        where.userId = filters.userId;
      }
      
      if (filters.ticketId) {
        const ticket = await canAccessTicket(filters.ticketId, authenticatedUser, prisma);
        if (!ticket) {
          throw new ForbiddenError('Access denied to ticket');
        }
        where.ticketId = filters.ticketId;
      }
      
      if (filters.from || filters.to) {
        const dateFilter: any = {};
        if (filters.from) dateFilter.gte = new Date(filters.from);
        if (filters.to) dateFilter.lte = new Date(filters.to);
        where.startTime = dateFilter;
      }
      
      if (filters.billable !== undefined) {
        where.billable = filters.billable;
      }

      return prisma.timeEntry.findMany({
        where,
        include: {
          ticket: { include: { company: true, contact: true } },
          user: true,
        },
        orderBy: { startTime: 'desc' },
        skip: offset,
        take: limit,
      });
    },

    timeEntry: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id: args.id },
        include: {
          ticket: { include: { company: true, contact: true } },
          user: true,
        },
      });

      if (!timeEntry) {
        throw new UserInputError('Time entry not found');
      }

      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot view time entries');
      }

      if (authenticatedUser.role === 'EMPLOYEE' && timeEntry.userId !== authenticatedUser.id) {
        throw new ForbiddenError('You can only view your own time entries');
      }

      const ticket = await canAccessTicket(timeEntry.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied to ticket');
      }

      return timeEntry;
    },

    myTimeEntries: async (_: any, args: { from?: string; to?: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot view time entries');
      }

      const where: any = { userId: authenticatedUser.id };
      
      if (args.from || args.to) {
        const dateFilter: any = {};
        if (args.from) dateFilter.gte = new Date(args.from);
        if (args.to) dateFilter.lte = new Date(args.to);
        where.startTime = dateFilter;
      }

      return prisma.timeEntry.findMany({
        where,
        include: {
          ticket: { include: { company: true, contact: true } },
          user: true,
        },
        orderBy: { startTime: 'desc' },
      });
    },
  },

  Mutation: {
    createTimeEntry: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot create time entries');
      }

      const { ticketId, description, startTime, endTime, billable = true } = args.data;

      if (!description?.trim()) {
        throw new UserInputError('Description is required');
      }

      const ticket = await canAccessTicket(ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      const duration = calculateDuration(startTime, endTime);

      try {
        const timeEntry = await prisma.timeEntry.create({
          data: {
            ticketId,
            userId: authenticatedUser.id,
            description: description.trim(),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            billable,
          },
          include: {
            ticket: { include: { company: true, contact: true } },
            user: true,
          },
        });

        await prisma.history.create({
          data: {
            ticketId,
            userId: authenticatedUser.id,
            type: 'TIME_LOGGED',
            message: `${duration} minutes logged by ${authenticatedUser.name}`,
          },
        });

        return timeEntry;
      } catch (error) {
        console.error('Error creating time entry:', error);
        throw new Error('Failed to create time entry');
      }
    },

    updateTimeEntry: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot update time entries');
      }

      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id: args.id },
        include: { ticket: true, user: true },
      });

      if (!timeEntry) {
        throw new UserInputError('Time entry not found');
      }

      if (timeEntry.userId !== authenticatedUser.id && authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only edit your own time entries');
      }

      const ticket = await canAccessTicket(timeEntry.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied to ticket');
      }

      const { description, startTime, endTime, billable } = args.data;
      const updateData: any = {};

      if (description !== undefined) {
        if (!description.trim()) {
          throw new UserInputError('Description cannot be empty');
        }
        updateData.description = description.trim();
      }

      if (startTime !== undefined || endTime !== undefined) {
        const newStartTime = startTime ? new Date(startTime) : timeEntry.startTime;
        const newEndTime = endTime ? new Date(endTime) : timeEntry.endTime;
        
        const duration = calculateDuration(newStartTime.toISOString(), newEndTime.toISOString());
        
        if (startTime !== undefined) updateData.startTime = newStartTime;
        if (endTime !== undefined) updateData.endTime = newEndTime;
        updateData.duration = duration;
      }

      if (billable !== undefined) {
        updateData.billable = billable;
      }

      try {
        return prisma.timeEntry.update({
          where: { id: args.id },
          data: updateData,
          include: {
            ticket: { include: { company: true, contact: true } },
            user: true,
          },
        });
      } catch (error) {
        console.error('Error updating time entry:', error);
        throw new Error('Failed to update time entry');
      }
    },

    deleteTimeEntry: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot delete time entries');
      }

      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id: args.id },
        include: { ticket: true, user: true },
      });

      if (!timeEntry) {
        throw new UserInputError('Time entry not found');
      }

      if (timeEntry.userId !== authenticatedUser.id && authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('You can only delete your own time entries');
      }

      const ticket = await canAccessTicket(timeEntry.ticketId, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied to ticket');
      }

      try {
        return prisma.timeEntry.delete({
          where: { id: args.id },
          include: {
            ticket: { include: { company: true, contact: true } },
            user: true,
          },
        });
      } catch (error) {
        console.error('Error deleting time entry:', error);
        throw new Error('Failed to delete time entry');
      }
    },
  },

  TimeEntry: {
    ticket: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.ticket) return parent.ticket;
      return prisma.ticket.findUnique({ 
        where: { id: parent.ticketId },
        include: { company: true, contact: true }
      });
    },
    
    user: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.user) return parent.user;
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};