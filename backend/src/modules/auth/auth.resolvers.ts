import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { validateEmail, validatePassword } from '../../utils/validation';

const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '7d' }
  );
};

export const resolvers = {
  Query: {
    _authQuery: () => true,
  },

  Mutation: {
    login: async (_: any, args: { data: any }, { prisma }: Context) => {
      const { email, password } = args.data;

      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }

        if (!user.isActive) {
          throw new AuthenticationError('Account is deactivated');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new AuthenticationError('Invalid credentials');
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        const token = generateToken(user.id);

        return {
          token,
          user: {
            ...user,
            password: undefined,
          },
        };
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof UserInputError) {
          throw error;
        }
        throw new Error('Login failed');
      }
    },

    register: async (_: any, args: { data: any }, { prisma }: Context) => {
      const { name, email, password } = args.data;

      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new UserInputError('Password must be at least 8 characters long');
      }

      if (!name || name.trim().length < 2) {
        throw new UserInputError('Name must be at least 2 characters long');
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (existingUser) {
          throw new UserInputError('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'CUSTOMER',
          },
        });

        const token = generateToken(user.id);

        return {
          token,
          user: {
            ...user,
            password: undefined,
          },
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new Error('Registration failed');
      }
    },

    refreshToken: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }

      const freshUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!freshUser || !freshUser.isActive) {
        throw new AuthenticationError('User not found or deactivated');
      }

      const token = generateToken(freshUser.id);

      return {
        token,
        user: {
          ...freshUser,
          password: undefined,
        },
      };
    },
  },
};