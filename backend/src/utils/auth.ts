import { AuthenticationError, ForbiddenError } from 'apollo-server-express';


export const requireAuth = (user: any): NonNullable<typeof user> => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};


export const requireAdmin = (user: any): NonNullable<typeof user> => {
  const authenticatedUser = requireAuth(user);
  if (authenticatedUser.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  return authenticatedUser;
};


export const requireEmployeeOrAdmin = (user: any): NonNullable<typeof user> => {
  const authenticatedUser = requireAuth(user);
  if (authenticatedUser.role === 'CUSTOMER') {
    throw new ForbiddenError('Employee or Admin access required');
  }
  return authenticatedUser;
};


export const canAccessTicket = async (ticketId: string, user: any, prisma: any) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { company: { include: { contacts: true } } }
  });

  if (!ticket) return false;

  if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') return ticket;

  if (user.role === 'CUSTOMER') {
    const userAsContact = await prisma.contact.findUnique({
      where: { email: user.email }
    });
    
    if (userAsContact && ticket.contactId === userAsContact.id) {
      return ticket;
    }
  }

  return false;
};

// ---------------------------------------------------------------------------------
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (end <= start) {
    throw new Error('End time must be after start time');
  }
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};