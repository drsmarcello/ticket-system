import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

// 🔐 Basis Auth-Helpers
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

// 🎫 Ticket Access Control
export const canAccessTicket = async (ticketId: string, user: any, prisma: any) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { company: { include: { contacts: true } } }
  });
  
  if (!ticket) return false;
  
  // Admin/Employee haben vollen Zugriff
  if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') return ticket;
  
  // Customer kann nur eigene Tickets sehen
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

// ⏰ Zeit-Helpers
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (end <= start) {
    throw new Error('End time must be after start time');
  }
  
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

// 🆕 Zusätzliche Helper für bessere Token-Verwaltung
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// 🔄 Role-based permissions
export const hasPermission = (user: any, requiredRoles: string[]): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

// 🏢 Company access helper
export const canAccessCompany = async (companyId: string, user: any, prisma: any) => {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'EMPLOYEE') {
    // Employee kann alle Companies sehen (je nach Business Logic)
    return true;
  }
  
  if (user.role === 'CUSTOMER') {
    const userAsContact = await prisma.contact.findUnique({
      where: { email: user.email },
      include: { company: true }
    });
    return userAsContact?.companyId === companyId;
  }
  
  return false;
};