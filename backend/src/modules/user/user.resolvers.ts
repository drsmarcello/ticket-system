import * as bcrypt from 'bcrypt';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { requireAuth, requireAdmin, requireEmployeeOrAdmin } from '../../utils/auth';
import { validateEmail, validatePassword } from '../../utils/validation';

export const resolvers = {
  Query: {
    users: async (_: any, __: any, { prisma, user }: Context) => {
      const authenticatedUser = requireEmployeeOrAdmin(user);
      
      if (authenticatedUser.role === 'EMPLOYEE') {
        return prisma.user.findMany({
          where: {
            role: { not: 'CUSTOMER' },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            role: true,
            isActive: true,
          },
          orderBy: { name: 'asc' },
        });
      }
      
      return prisma.user.findMany({
        orderBy: { name: 'asc' },
      });
    },

    user: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role !== 'ADMIN' && authenticatedUser.id !== args.id) {
        throw new ForbiddenError('Access denied');
      }
      
      const foundUser = await prisma.user.findUnique({
        where: { id: args.id },
      });
      
      if (!foundUser) {
        throw new UserInputError('User not found');
      }
      
      return foundUser;
    },

    me: async (_: any, __: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      return prisma.user.findUnique({
        where: { id: authenticatedUser.id },
      });
    },
  },

  Mutation: {
    createUser: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      requireAdmin(user);
      
      const { name, email, password, role } = args.data;
      
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }
      
      if (!validatePassword(password)) {
        throw new UserInputError('Password must be at least 8 characters long');
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }
      
      try {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        return prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
      }
    },

    updateUser: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      requireAdmin(user);
      
      const { name, email, password, role, isActive } = args.data;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) {
        if (!validateEmail(email)) {
          throw new UserInputError('Invalid email format');
        }
        updateData.email = email;
      }
      if (password !== undefined) {
        if (!validatePassword(password)) {
          throw new UserInputError('Password must be at least 8 characters long');
        }
        updateData.password = await bcrypt.hash(password, 12);
      }
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      try {
        return prisma.user.update({
          where: { id: args.id },
          data: updateData,
        });
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
      }
    },

    updateProfile: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      const { name, email, password } = args.data;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) {
        if (!validateEmail(email)) {
          throw new UserInputError('Invalid email format');
        }
        updateData.email = email;
      }
      if (password !== undefined) {
        if (!validatePassword(password)) {
          throw new UserInputError('Password must be at least 8 characters long');
        }
        updateData.password = await bcrypt.hash(password, 12);
      }
      
      try {
        return prisma.user.update({
          where: { id: authenticatedUser.id },
          data: updateData,
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
      }
    },

    deleteUser: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAdmin(user);
      
      if (authenticatedUser.id === args.id) {
        throw new UserInputError('Cannot delete your own account');
      }
      
      try {
        return prisma.user.delete({
          where: { id: args.id },
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
      }
    },
  },

  User: {
    assignedTickets: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.ticket.findMany({
        where: { assignedToId: parent.id },
        include: {
          company: true,
          contact: true,
        },
      });
    },

    createdTickets: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.ticket.findMany({
        where: { createdById: parent.id },
        include: {
          company: true,
          contact: true,
        },
      });
    },

    timeEntries: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.timeEntry.findMany({
        where: { userId: parent.id },
        include: {
          ticket: true,
        },
      });
    },

    comments: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.comment.findMany({
        where: { userId: parent.id },
        include: {
          ticket: true,
        },
      });
    },
  },
};