import { PrismaClient } from '@prisma/client';

export const updateTicketWorkSummary = async (prisma: PrismaClient, ticketId: string) => {
  // Hole alle TimeEntries für das Ticket (chronologisch)
  const timeEntries = await prisma.timeEntry.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'asc' },
    select: { description: true }
  });

  // Baue Work Summary zusammen
  const workSummary = timeEntries
    .map(entry => entry.description.trim())
    .filter(desc => desc.length > 0) // Leere Beschreibungen rausfiltern
    .join('\n\n'); // Doppelter Zeilenumbruch für Absätze

  // Update Ticket
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { workSummary: workSummary || null }
  });

  return workSummary;
};