import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { requireAuth, canAccessTicket } from '../../utils/auth';

export const resolvers = {
  Query: {
    tickets: async (_: any, args: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const { filters = {}, limit = 50, offset = 0 } = args;
      const where: any = {};

      if (authenticatedUser.role === 'CUSTOMER') {
        const userContact = await prisma.contact.findUnique({
          where: { email: authenticatedUser.email }
        });
        if (userContact) {
          where.contactId = userContact.id;
        } else {
          return [];
        }
      }

      if (filters.status) {
        if (filters.status === 'NOT_CLOSED') {
          where.status = {
            notIn: ['CLOSED', 'COMPLETED']
          };
        } else {
          where.status = filters.status;
        }
      }

      if (filters.priority) where.priority = filters.priority;
      if (filters.assignedToId) where.assignedToId = filters.assignedToId;
      if (filters.companyId) where.companyId = filters.companyId;
      if (filters.createdById) where.createdById = filters.createdById;

      return prisma.ticket.findMany({
        where,
        include: {
          company: true,
          contact: true,
          assignedTo: true,
          createdBy: true,
          timeEntries: { include: { user: true } },
          comments: { include: { user: true } },
          histories: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });
    },

    ticket: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const ticket = await canAccessTicket(args.id, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      return prisma.ticket.findUnique({
        where: { id: args.id },
        include: {
          company: true,
          contact: true,
          assignedTo: true,
          createdBy: true,
          timeEntries: { include: { user: true }, orderBy: { startTime: 'desc' } },
          comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
          histories: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        },
      });
    },

    myTickets: async (_: any, __: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        const userContact = await prisma.contact.findUnique({
          where: { email: authenticatedUser.email }
        });
        
        if (!userContact) return [];
        
        return prisma.ticket.findMany({
          where: { contactId: userContact.id },
          include: {
            company: true,
            contact: true,
            assignedTo: true,
            createdBy: true,
            timeEntries: { include: { user: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
      
      return prisma.ticket.findMany({
        where: { createdById: authenticatedUser.id },
        include: {
          company: true,
          contact: true,
          assignedTo: true,
          createdBy: true,
          timeEntries: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    myAssignedTickets: async (_: any, __: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot have assigned tickets');
      }
      
      return prisma.ticket.findMany({
        where: { assignedToId: authenticatedUser.id },
        include: {
          company: true,
          contact: true,
          assignedTo: true,
          createdBy: true,
          timeEntries: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createTicket: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      let { title, description, companyId, contactId, assignedToId, priority, estimatedMinutes } = args.data;
      
      if (!title?.trim()) {
        throw new UserInputError('Title is required');
      }
      
      if (!description?.trim()) {
        throw new UserInputError('Description is required');
      }

      if (authenticatedUser.role === 'CUSTOMER') {
        const userContact = await prisma.contact.findUnique({
          where: { email: authenticatedUser.email },
          include: { company: true }
        });
        
        if (!userContact) {
          throw new UserInputError('No contact found for your account');
        }
        
        companyId = userContact.companyId;
        contactId = userContact.id;
      }

      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        throw new UserInputError('Company not found');
      }

      const contact = await prisma.contact.findUnique({ 
        where: { id: contactId },
        include: { company: true }
      });
      if (!contact) {
        throw new UserInputError('Contact not found');
      }

      if (contact.companyId !== companyId) {
        throw new UserInputError('Contact does not belong to the specified company');
      }

      if (authenticatedUser.role === 'CUSTOMER') {
        if (contact.email !== authenticatedUser.email) {
          throw new ForbiddenError('Customers can only create tickets for themselves');
        }
      }

      if (assignedToId) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: assignedToId }
        });
        if (!assignedUser || assignedUser.role === 'CUSTOMER') {
          throw new UserInputError('Invalid assigned user');
        }
      }

      if (estimatedMinutes !== undefined && estimatedMinutes !== null) {
        if (estimatedMinutes < 0) {
          throw new UserInputError('Estimated minutes cannot be negative');
        }
        if (estimatedMinutes > 10080) {
          throw new UserInputError('Estimated minutes cannot exceed 7 days (10080 minutes)');
        }
      }

      try {
        const ticket = await prisma.ticket.create({
          data: {
            title: title.trim(),
            description: description.trim(),
            companyId,
            contactId,
            assignedToId,
            createdById: authenticatedUser.id,
            priority: priority || 'MEDIUM',
            estimatedMinutes: estimatedMinutes || null,
          },
          include: {
            company: true,
            contact: true,
            assignedTo: true,
            createdBy: true,
            timeEntries: { include: { user: true } },
            comments: { include: { user: true } },
            histories: { include: { user: true } },
          },
        });

        let historyMessage = `Ticket created by ${authenticatedUser.name}`;
        if (estimatedMinutes) {
          const hours = Math.floor(estimatedMinutes / 60);
          const mins = estimatedMinutes % 60;
          historyMessage += ` with estimated time: ${hours}:${mins.toString().padStart(2, '0')}h`;
        }

        await prisma.history.create({
          data: {
            ticketId: ticket.id,
            userId: authenticatedUser.id,
            type: 'CREATED',
            message: historyMessage,
          },
        });

        return ticket;
      } catch (error) {
        console.error('Error creating ticket:', error);
        throw new Error('Failed to create ticket');
      }
    },

    updateTicket: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const ticket = await canAccessTicket(args.id, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot update tickets directly');
      }

      const { title, description, status, priority, assignedToId, companyId, contactId, estimatedMinutes } = args.data;
      const updateData: any = {};
      const changes: string[] = [];

      if (title !== undefined) {
        updateData.title = title.trim();
        changes.push(`Title changed to "${title}"`);
      }
      
      if (description !== undefined) {
        updateData.description = description.trim();
        changes.push('Description updated');
      }
      
      if (status !== undefined && status !== ticket.status) {
        updateData.status = status;
        changes.push(`Status changed from ${ticket.status} to ${status}`);
      }
      
      if (priority !== undefined && priority !== ticket.priority) {
        updateData.priority = priority;
        changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
      }

      if (estimatedMinutes !== undefined) {
        if (estimatedMinutes !== null && estimatedMinutes < 0) {
          throw new UserInputError('Estimated minutes cannot be negative');
        }
        if (estimatedMinutes !== null && estimatedMinutes > 10080) {
          throw new UserInputError('Estimated minutes cannot exceed 7 days (10080 minutes)');
        }

        if (estimatedMinutes !== ticket.estimatedMinutes) {
          updateData.estimatedMinutes = estimatedMinutes;
          if (estimatedMinutes) {
            const hours = Math.floor(estimatedMinutes / 60);
            const mins = estimatedMinutes % 60;
            changes.push(`Estimated time set to ${hours}:${mins.toString().padStart(2, '0')}h`);
          } else {
            changes.push('Estimated time removed');
          }
        }
      }

      if (assignedToId !== undefined) {
        if (assignedToId !== ticket.assignedToId) {
          if (assignedToId) {
            const assignedUser = await prisma.user.findUnique({
              where: { id: assignedToId }
            });
            if (!assignedUser || assignedUser.role === 'CUSTOMER') {
              throw new UserInputError('Invalid assigned user');
            }
            updateData.assignedToId = assignedToId;
            changes.push(`Assigned to ${assignedUser.name}`);
          } else {
            updateData.assignedToId = null;
            changes.push('Assignment removed');
          }
        }
      }

      if (companyId !== undefined && companyId !== ticket.companyId) {
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
          throw new UserInputError('Company not found');
        }
        updateData.companyId = companyId;
        changes.push(`Company changed to ${company.name}`);
      }

      if (contactId !== undefined && contactId !== ticket.contactId) {
        const contact = await prisma.contact.findUnique({
          where: { id: contactId },
          include: { company: true }
        });
        if (!contact) {
          throw new UserInputError('Contact not found');
        }
        updateData.contactId = contactId;
        changes.push(`Contact changed to ${contact.name}`);
      }

      try {
        const updatedTicket = await prisma.ticket.update({
          where: { id: args.id },
          data: updateData,
          include: {
            company: true,
            contact: true,
            assignedTo: true,
            createdBy: true,
            timeEntries: { include: { user: true }, orderBy: { startTime: 'desc' } },
            comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
            histories: { include: { user: true }, orderBy: { createdAt: 'desc' } },
          },
        });

        if (changes.length > 0) {
          await prisma.history.create({
            data: {
              ticketId: args.id,
              userId: authenticatedUser.id,
              type: 'STATUS_CHANGE',
              message: changes.join(', '),
            },
          });
        }

        return updatedTicket;
      } catch (error) {
        console.error('Error updating ticket:', error);
        throw new Error('Failed to update ticket');
      }
    },

    assignTicket: async (_: any, args: { id: string; assignedToId: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot assign tickets');
      }

      const ticket = await canAccessTicket(args.id, authenticatedUser, prisma);
      if (!ticket) {
        throw new ForbiddenError('Access denied or ticket not found');
      }

      const assignedUser = await prisma.user.findUnique({
        where: { id: args.assignedToId }
      });

      if (!assignedUser || assignedUser.role === 'CUSTOMER') {
        throw new UserInputError('Invalid assigned user');
      }

      try {
        const updatedTicket = await prisma.ticket.update({
          where: { id: args.id },
          data: { assignedToId: args.assignedToId },
          include: {
            company: true,
            contact: true,
            assignedTo: true,
            createdBy: true,
            timeEntries: { include: { user: true } },
            comments: { include: { user: true } },
            histories: { include: { user: true } },
          },
        });

        await prisma.history.create({
          data: {
            ticketId: args.id,
            userId: authenticatedUser.id,
            type: 'ASSIGNMENT_CHANGE',
            message: `Ticket assigned to ${assignedUser.name}`,
          },
        });

        return updatedTicket;
      } catch (error) {
        console.error('Error assigning ticket:', error);
        throw new Error('Failed to assign ticket');
      }
    },

    deleteTicket: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can delete tickets');
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: args.id } });
      if (!ticket) {
        throw new UserInputError('Ticket not found');
      }

      try {
        return prisma.ticket.delete({
          where: { id: args.id },
          include: {
            company: true,
            contact: true,
            assignedTo: true,
            createdBy: true,
            timeEntries: { include: { user: true } },
            comments: { include: { user: true } },
            histories: { include: { user: true } },
          },
        });
      } catch (error) {
        console.error('Error deleting ticket:', error);
        throw new Error('Failed to delete ticket');
      }
    },
  },

  Ticket: {
    company: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.company) return parent.company;
      return prisma.company.findUnique({ where: { id: parent.companyId } });
    },
    
    contact: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.contact) return parent.contact;
      return prisma.contact.findUnique({ where: { id: parent.contactId } });
    },
    
    assignedTo: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.assignedToId) return null;
      if (parent.assignedTo) return parent.assignedTo;
      return prisma.user.findUnique({ where: { id: parent.assignedToId } });
    },
    
    createdBy: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.createdById) return null;
      if (parent.createdBy) return parent.createdBy;
      return prisma.user.findUnique({ where: { id: parent.createdById } });
    },
    
    timeEntries: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.timeEntries) return parent.timeEntries;
      return prisma.timeEntry.findMany({
        where: { ticketId: parent.id },
        include: { user: true },
        orderBy: { startTime: 'desc' },
      });
    },
    
    comments: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.comments) return parent.comments;
      return prisma.comment.findMany({
        where: { ticketId: parent.id },
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      });
    },
    
    histories: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.histories) return parent.histories;
      return prisma.history.findMany({
        where: { ticketId: parent.id },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
};