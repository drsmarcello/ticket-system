// prisma/seed.ts
import { PrismaClient, Role, TicketStatus, TicketPriority, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.timeEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.history.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log('👤 Creating users...');
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@ticketsystem.com',
      password: await bcrypt.hash('admin123', 12),
      role: Role.ADMIN,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'Max Mustermann',
      email: 'max.mustermann@ticketsystem.com',
      password: await bcrypt.hash('employee123', 12),
      role: Role.EMPLOYEE,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Sarah Schmidt',
      email: 'sarah.schmidt@ticketsystem.com',
      password: await bcrypt.hash('employee123', 12),
      role: Role.EMPLOYEE,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Hans Kunde',
      email: 'hans.kunde@kunden-firma.de',
      password: await bcrypt.hash('customer123', 12),
      role: Role.CUSTOMER,
    },
  });

  // 3. Create Companies
  console.log('🏢 Creating companies...');

  const company1 = await prisma.company.create({
    data: {
      name: 'TechCorp GmbH',
      email: 'kontakt@techcorp.de',
      phone: '+49 30 12345678',
      address: 'Alexanderplatz 1, 10178 Berlin',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'InnovateSoft AG',
      email: 'info@innovatesoft.com',
      phone: '+49 89 87654321',
      address: 'Marienplatz 8, 80331 München',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Kunden-Firma KG',
      email: 'info@kunden-firma.de',
      phone: '+49 40 11111111',
      address: 'Speicherstadt 12, 20457 Hamburg',
    },
  });

  // 4. Create Contacts
  console.log('📞 Creating contacts...');

  const contact1 = await prisma.contact.create({
    data: {
      name: 'Peter Techniker',
      email: 'peter.techniker@techcorp.de',
      phone: '+49 30 12345679',
      companyId: company1.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Lisa Administrator',
      email: 'lisa.admin@techcorp.de',
      phone: '+49 30 12345680',
      companyId: company1.id,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      name: 'Michael Developer',
      email: 'michael.dev@innovatesoft.com',
      phone: '+49 89 87654322',
      companyId: company2.id,
    },
  });

  const contact4 = await prisma.contact.create({
    data: {
      name: 'Hans Kunde',
      email: 'hans.kunde@kunden-firma.de',
      phone: '+49 40 11111112',
      companyId: company3.id,
    },
  });

  // Set primary contacts
  await prisma.company.update({
    where: { id: company1.id },
    data: { primaryContactId: contact1.id },
  });

  await prisma.company.update({
    where: { id: company2.id },
    data: { primaryContactId: contact3.id },
  });

  await prisma.company.update({
    where: { id: company3.id },
    data: { primaryContactId: contact4.id },
  });

  // 5. Create Tickets
  console.log('🎫 Creating tickets...');

  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Server nicht erreichbar',
      description: 'Unser Hauptserver ist seit heute Morgen nicht mehr erreichbar. Alle Services sind betroffen.',
      companyId: company1.id,
      contactId: contact1.id,
      assignedToId: employee1.id,
      createdById: adminUser.id,
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'E-Mail-Konfiguration Probleme',
      description: 'Können keine E-Mails mehr versenden. Outlook zeigt Fehlermeldung an.',
      companyId: company1.id,
      contactId: contact2.id,
      assignedToId: employee2.id,
      createdById: adminUser.id,
      status: TicketStatus.NEW,
      priority: TicketPriority.HIGH,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Neue Software Installation',
      description: 'Benötigen Hilfe bei der Installation der neuen Entwicklungsumgebung.',
      companyId: company2.id,
      contactId: contact3.id,
      assignedToId: employee1.id,
      createdById: adminUser.id,
      status: TicketStatus.COMPLETED,
      priority: TicketPriority.MEDIUM,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Passwort zurücksetzen',
      description: 'Habe mein Passwort vergessen und komme nicht mehr ins System.',
      companyId: company3.id,
      contactId: contact4.id,
      assignedToId: employee2.id,
      createdById: customerUser.id,
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      title: 'Backup-System prüfen',
      description: 'Regelmäßige Überprüfung des Backup-Systems. Letztes Backup ist 3 Tage alt.',
      companyId: company1.id,
      contactId: contact1.id,
      assignedToId: null, // Nicht zugewiesen
      createdById: adminUser.id,
      status: TicketStatus.NEW,
      priority: TicketPriority.MEDIUM,
    },
  });

  console.log('Ticket 5 created:', ticket5.id); // oder verwende es irgendwie


  // 6. Create Comments
  console.log('💬 Creating comments...');

  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      content: 'Ich schaue mir das Problem sofort an. Erste Diagnose läuft.',
      isInternal: false,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      content: 'Server-Logs zeigen Festplatten-Fehler. Hardware-Team benachrichtigt.',
      isInternal: true,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      userId: adminUser.id, // Customer User statt Contact
      content: 'Danke für die schnelle Reaktion! Bitte halten Sie uns auf dem Laufenden.',
      isInternal: false,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      userId: employee2.id,
      content: 'Habe das Problem identifiziert. SMTP-Einstellungen sind fehlerhaft.',
      isInternal: false,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket3.id,
      userId: employee1.id,
      content: 'Installation erfolgreich abgeschlossen. Alle Tests bestanden.',
      isInternal: false,
    },
  });

  // 7. Create Time Entries
  console.log('⏰ Creating time entries...');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  await prisma.timeEntry.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      description: 'Erste Diagnose und Problemanalyse',
      startTime: new Date(yesterday.setHours(9, 0, 0)),
      endTime: new Date(yesterday.setHours(10, 30, 0)),
      duration: 90, // 1.5 Stunden
      billable: true,
    },
  });

  await prisma.timeEntry.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      description: 'Hardware-Tausch und System-Wiederherstellung',
      startTime: new Date(yesterday.setHours(14, 0, 0)),
      endTime: new Date(yesterday.setHours(17, 0, 0)),
      duration: 180, // 3 Stunden
      billable: true,
    },
  });

  await prisma.timeEntry.create({
    data: {
      ticketId: ticket2.id,
      userId: employee2.id,
      description: 'E-Mail-Konfiguration überprüfen und korrigieren',
      startTime: new Date(twoDaysAgo.setHours(10, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(11, 15, 0)),
      duration: 75, // 1.25 Stunden
      billable: true,
    },
  });

  await prisma.timeEntry.create({
    data: {
      ticketId: ticket3.id,
      userId: employee1.id,
      description: 'Software-Installation und Konfiguration',
      startTime: new Date(twoDaysAgo.setHours(13, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(15, 30, 0)),
      duration: 150, // 2.5 Stunden
      billable: true,
    },
  });

  await prisma.timeEntry.create({
    data: {
      ticketId: ticket4.id,
      userId: employee2.id,
      description: 'Passwort zurücksetzen und Account-Verifizierung',
      startTime: new Date(twoDaysAgo.setHours(16, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(16, 15, 0)),
      duration: 15, // 15 Minuten
      billable: false, // Kleine Service-Aufgabe
    },
  });

  // 8. Create History Entries
  console.log('📚 Creating history entries...');

  await prisma.history.create({
    data: {
      ticketId: ticket1.id,
      userId: adminUser.id,
      type: ActivityType.CREATED,
      message: 'Ticket created by System Administrator',
    },
  });

  await prisma.history.create({
    data: {
      ticketId: ticket1.id,
      userId: adminUser.id,
      type: ActivityType.ASSIGNMENT_CHANGE,
      message: 'Ticket assigned to Max Mustermann',
    },
  });

  await prisma.history.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      type: ActivityType.STATUS_CHANGE,
      oldValue: 'NEW',
      newValue: 'IN_PROGRESS',
      message: 'Status changed from NEW to IN_PROGRESS',
    },
  });

  await prisma.history.create({
    data: {
      ticketId: ticket1.id,
      userId: employee1.id,
      type: ActivityType.TIME_LOGGED,
      message: '90 minutes logged by Max Mustermann',
    },
  });

  await prisma.history.create({
    data: {
      ticketId: ticket3.id,
      userId: employee1.id,
      type: ActivityType.STATUS_CHANGE,
      oldValue: 'IN_PROGRESS',
      newValue: 'COMPLETED',
      message: 'Status changed from IN_PROGRESS to COMPLETED',
    },
  });

  await prisma.history.create({
    data: {
      ticketId: ticket4.id,
      userId: employee2.id,
      type: ActivityType.STATUS_CHANGE,
      oldValue: 'COMPLETED',
      newValue: 'CLOSED',
      message: 'Status changed from COMPLETED to CLOSED',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  
  // Zusammenfassung der erstellten Daten
  console.log('\n📊 Created data summary:');
  console.log(`👥 Users: ${await prisma.user.count()}`);
  console.log(`🏢 Companies: ${await prisma.company.count()}`);
  console.log(`📞 Contacts: ${await prisma.contact.count()}`);
  console.log(`🎫 Tickets: ${await prisma.ticket.count()}`);
  console.log(`💬 Comments: ${await prisma.comment.count()}`);
  console.log(`⏰ Time Entries: ${await prisma.timeEntry.count()}`);
  console.log(`📚 History Entries: ${await prisma.history.count()}`);

  console.log('\n🔐 Test Login Credentials:');
  console.log('Admin: admin@ticketsystem.com / admin123');
  console.log('Employee 1: max.mustermann@ticketsystem.com / employee123');
  console.log('Employee 2: sarah.schmidt@ticketsystem.com / employee123');
  console.log('Customer: hans.kunde@kunden-firma.de / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });