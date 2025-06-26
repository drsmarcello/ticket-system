import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { requireAuth, requireEmployeeOrAdmin } from '../../utils/auth';
import { validateEmail, validateName, validatePhone, sanitizeString } from '../../utils/validation';

export const resolvers = {
  Query: {
    companies: async (_: any, __: any, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      return prisma.company.findMany({
        include: { 
          contacts: true,
          primaryContact: true 
        },
        orderBy: { name: 'asc' },
      });
    },
    
    company: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const company = await prisma.company.findUnique({
        where: { id: args.id },
        include: { 
          contacts: true,
          primaryContact: true 
        },
      });

      if (!company) {
        throw new UserInputError('Company not found');
      }

      return company;
    },
    
    contacts: async (_: any, args: { companyId: string }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const company = await prisma.company.findUnique({
        where: { id: args.companyId }
      });

      if (!company) {
        throw new UserInputError('Company not found');
      }

      return prisma.contact.findMany({
        where: { companyId: args.companyId },
        include: { company: true },
        orderBy: { name: 'asc' },
      });
    },
    
    contact: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const contact = await prisma.contact.findUnique({
        where: { id: args.id },
        include: { company: true },
      });

      if (!contact) {
        throw new UserInputError('Contact not found');
      }

      return contact;
    },

    myContactInfo: async (_: any, __: any, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role !== 'CUSTOMER') {
        throw new ForbiddenError('Only customers can access this endpoint');
      }
      
      const contact = await prisma.contact.findUnique({
        where: { email: authenticatedUser.email },
        include: { company: true },
      });
      
      return contact;
    },
  },

  Mutation: {
    createCompany: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const { name, email, phone, address, primaryContactId } = args.data;
      
      if (!validateName(name)) {
        throw new UserInputError('Company name must be at least 2 characters long');
      }
      
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }

      if (phone && !validatePhone(phone)) {
        throw new UserInputError('Invalid phone number format');
      }

      const existingCompany = await prisma.company.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingCompany) {
        throw new UserInputError('Company with this email already exists');
      }

      if (primaryContactId) {
        const contact = await prisma.contact.findUnique({
          where: { id: primaryContactId }
        });
        if (!contact) {
          throw new UserInputError('Primary contact not found');
        }
      }

      try {
        return prisma.company.create({
          data: {
            name: sanitizeString(name),
            email: email.toLowerCase(),
            phone: phone ? sanitizeString(phone) : null,
            address: address ? sanitizeString(address) : null,
            primaryContactId,
          },
          include: { 
            contacts: true,
            primaryContact: true 
          },
        });
      } catch (error) {
        console.error('Error creating company:', error);
        throw new Error('Failed to create company');
      }
    },
    
    updateCompany: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const company = await prisma.company.findUnique({
        where: { id: args.id }
      });

      if (!company) {
        throw new UserInputError('Company not found');
      }

      const { name, email, phone, address, primaryContactId } = args.data;
      const updateData: any = {};

      if (name !== undefined) {
        if (!validateName(name)) {
          throw new UserInputError('Company name must be at least 2 characters long');
        }
        updateData.name = sanitizeString(name);
      }

      if (email !== undefined) {
        if (!validateEmail(email)) {
          throw new UserInputError('Invalid email format');
        }
        
        const existingCompany = await prisma.company.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingCompany && existingCompany.id !== args.id) {
          throw new UserInputError('Company with this email already exists');
        }

        updateData.email = email.toLowerCase();
      }

      if (phone !== undefined) {
        if (phone && !validatePhone(phone)) {
          throw new UserInputError('Invalid phone number format');
        }
        updateData.phone = phone ? sanitizeString(phone) : null;
      }

      if (address !== undefined) {
        updateData.address = address ? sanitizeString(address) : null;
      }

      if (primaryContactId !== undefined) {
        if (primaryContactId) {
          const contact = await prisma.contact.findUnique({
            where: { id: primaryContactId }
          });
          if (!contact) {
            throw new UserInputError('Primary contact not found');
          }
          if (contact.companyId !== args.id) {
            throw new UserInputError('Primary contact must belong to this company');
          }
        }
        updateData.primaryContactId = primaryContactId;
      }

      try {
        return prisma.company.update({
          where: { id: args.id },
          data: updateData,
          include: { 
            contacts: true,
            primaryContact: true 
          },
        });
      } catch (error) {
        console.error('Error updating company:', error);
        throw new Error('Failed to update company');
      }
    },
    
    deleteCompany: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can delete companies');
      }

      const company = await prisma.company.findUnique({
        where: { id: args.id },
        include: { tickets: true }
      });

      if (!company) {
        throw new UserInputError('Company not found');
      }

      if (company.tickets.length > 0) {
        throw new UserInputError('Cannot delete company with existing tickets');
      }

      try {
        return prisma.company.delete({
          where: { id: args.id },
          include: { 
            contacts: true,
            primaryContact: true 
          },
        });
      } catch (error) {
        console.error('Error deleting company:', error);
        throw new Error('Failed to delete company');
      }
    },
    
    createContact: async (_: any, args: { data: any }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const { name, email, phone, companyId } = args.data;

      if (!validateName(name)) {
        throw new UserInputError('Contact name must be at least 2 characters long');
      }

      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }

      if (phone && !validatePhone(phone)) {
        throw new UserInputError('Invalid phone number format');
      }

      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new UserInputError('Company not found');
      }

      const existingContact = await prisma.contact.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingContact) {
        throw new UserInputError('Contact with this email already exists');
      }

      try {
        return prisma.contact.create({
          data: {
            name: sanitizeString(name),
            email: email.toLowerCase(),
            phone: phone ? sanitizeString(phone) : null,
            companyId,
          },
          include: { company: true },
        });
      } catch (error) {
        console.error('Error creating contact:', error);
        throw new Error('Failed to create contact');
      }
    },
    
    updateContact: async (_: any, args: { id: string; data: any }, { prisma, user }: Context) => {
      requireEmployeeOrAdmin(user);
      
      const contact = await prisma.contact.findUnique({
        where: { id: args.id }
      });

      if (!contact) {
        throw new UserInputError('Contact not found');
      }

      const { name, email, phone, companyId } = args.data;
      const updateData: any = {};

      if (name !== undefined) {
        if (!validateName(name)) {
          throw new UserInputError('Contact name must be at least 2 characters long');
        }
        updateData.name = sanitizeString(name);
      }

      if (email !== undefined) {
        if (!validateEmail(email)) {
          throw new UserInputError('Invalid email format');
        }

        const existingContact = await prisma.contact.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingContact && existingContact.id !== args.id) {
          throw new UserInputError('Contact with this email already exists');
        }

        updateData.email = email.toLowerCase();
      }

      if (phone !== undefined) {
        if (phone && !validatePhone(phone)) {
          throw new UserInputError('Invalid phone number format');
        }
        updateData.phone = phone ? sanitizeString(phone) : null;
      }

      if (companyId !== undefined) {
        const company = await prisma.company.findUnique({
          where: { id: companyId }
        });

        if (!company) {
          throw new UserInputError('Company not found');
        }

        updateData.companyId = companyId;
      }

      try {
        return prisma.contact.update({
          where: { id: args.id },
          data: updateData,
          include: { company: true },
        });
      } catch (error) {
        console.error('Error updating contact:', error);
        throw new Error('Failed to update contact');
      }
    },
    
    deleteContact: async (_: any, args: { id: string }, { prisma, user }: Context) => {
      const authenticatedUser = requireAuth(user);
      
      if (authenticatedUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can delete contacts');
      }

      const contact = await prisma.contact.findUnique({
        where: { id: args.id },
        include: { tickets: true }
      });

      if (!contact) {
        throw new UserInputError('Contact not found');
      }

      if (contact.tickets.length > 0) {
        throw new UserInputError('Cannot delete contact with existing tickets');
      }

      try {
        await prisma.company.updateMany({
          where: { primaryContactId: args.id },
          data: { primaryContactId: null }
        });

        return prisma.contact.delete({
          where: { id: args.id },
          include: { company: true },
        });
      } catch (error) {
        console.error('Error deleting contact:', error);
        throw new Error('Failed to delete contact');
      }
    },
  },

  Company: {
    primaryContact: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.primaryContactId) return null;
      if (parent.primaryContact) return parent.primaryContact;
      
      return prisma.contact.findUnique({
        where: { id: parent.primaryContactId },
        include: { company: true },
      });
    },
    
    contacts: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.contacts) return parent.contacts;
      
      return prisma.contact.findMany({
        where: { companyId: parent.id },
        include: { company: true },
        orderBy: { name: 'asc' },
      });
    },
    
    tickets: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.ticket.findMany({
        where: { companyId: parent.id },
        include: {
          contact: true,
          assignedTo: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Contact: {
    company: async (parent: any, _: any, { prisma }: Context) => {
      if (parent.company) return parent.company;
      
      return prisma.company.findUnique({
        where: { id: parent.companyId },
        include: { 
          contacts: true,
          primaryContact: true 
        },
      });
    },

    tickets: async (parent: any, _: any, { prisma }: Context) => {
      return prisma.ticket.findMany({
        where: { contactId: parent.id },
        include: {
          company: true,
          assignedTo: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
};