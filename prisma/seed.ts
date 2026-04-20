import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'Default workspace',
    },
  })

  await prisma.workspaceTheme.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      primaryColor: '#3B82F6',
      accentColor: '#8B5CF6',
      companyName: 'Acme Corporation',
      headerText: 'Acme Corporation — Internal Procedures',
      footerText: 'Confidential — For Internal Use Only',
    },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@acme.com',
      role: 'admin',
      workspaceId: workspace.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'jane@acme.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@acme.com',
      role: 'member',
      workspaceId: workspace.id,
    },
  })

  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name_workspaceId: { name: 'Safety', workspaceId: workspace.id } }, update: {}, create: { name: 'Safety', color: '#EF4444', workspaceId: workspace.id } }),
    prisma.tag.upsert({ where: { name_workspaceId: { name: 'HR', workspaceId: workspace.id } }, update: {}, create: { name: 'HR', color: '#8B5CF6', workspaceId: workspace.id } }),
    prisma.tag.upsert({ where: { name_workspaceId: { name: 'IT', workspaceId: workspace.id } }, update: {}, create: { name: 'IT', color: '#3B82F6', workspaceId: workspace.id } }),
    prisma.tag.upsert({ where: { name_workspaceId: { name: 'Operations', workspaceId: workspace.id } }, update: {}, create: { name: 'Operations', color: '#F59E0B', workspaceId: workspace.id } }),
    prisma.tag.upsert({ where: { name_workspaceId: { name: 'Compliance', workspaceId: workspace.id } }, update: {}, create: { name: 'Compliance', color: '#10B981', workspaceId: workspace.id } }),
  ])

  const employeeOnboarding = await prisma.procedure.upsert({
    where: { id: 'proc_onboarding_001' },
    update: {},
    create: {
      id: 'proc_onboarding_001',
      workspaceId: workspace.id,
      ownerId: adminUser.id,
      title: 'Employee Onboarding Checklist',
      description: 'Standard onboarding procedure for all new employees joining Acme Corporation.',
      type: 'procedure',
      category: 'HR',
      department: 'Human Resources',
      status: 'published',
    },
  })

  const version1 = await prisma.procedureVersion.upsert({
    where: { procedureId_version: { procedureId: employeeOnboarding.id, version: 1 } },
    update: {},
    create: {
      procedureId: employeeOnboarding.id,
      version: 1,
      status: 'published',
      publishedAt: new Date(),
      notes: 'Initial version',
    },
  })

  await prisma.procedure.update({ where: { id: employeeOnboarding.id }, data: { currentVersionId: version1.id } })

  const section1 = await prisma.procedureSection.create({
    data: {
      versionId: version1.id,
      title: 'Day 1 — Welcome & Setup',
      description: 'Complete these tasks on the employee\'s first day.',
      order: 0,
      style: JSON.stringify({ backgroundColor: '#EFF6FF' }),
    },
  })

  await prisma.procedureBlock.createMany({
    data: [
      {
        sectionId: section1.id,
        type: 'instruction',
        order: 0,
        content: JSON.stringify({ text: 'Welcome to Acme Corporation! This checklist will guide you through your first day. Please complete each task in order and check them off as you go.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({}),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section1.id,
        type: 'checklist_item',
        order: 1,
        content: JSON.stringify({ label: 'Collect employee ID badge from reception', description: 'Visit the front desk at Level 1 to collect your access badge.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section1.id,
        type: 'checklist_item',
        order: 2,
        content: JSON.stringify({ label: 'Set up workstation and equipment', description: 'IT will assist you with laptop setup, VPN, and software installation.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section1.id,
        type: 'checklist_item',
        order: 3,
        content: JSON.stringify({ label: 'Complete account setup (email, Slack, Jira)', description: 'Use your corporate email to sign in to all required systems.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section1.id,
        type: 'text_field',
        order: 4,
        content: JSON.stringify({ label: 'Employee ID Number', placeholder: 'e.g. EMP-12345', description: 'Enter the ID from your badge.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
    ],
  })

  const section2 = await prisma.procedureSection.create({
    data: {
      versionId: version1.id,
      title: 'Week 1 — Training & Compliance',
      description: 'Complete mandatory training modules within your first week.',
      order: 1,
      style: JSON.stringify({ backgroundColor: '#F0FDF4' }),
    },
  })

  await prisma.procedureBlock.createMany({
    data: [
      {
        sectionId: section2.id,
        type: 'warning',
        order: 0,
        content: JSON.stringify({ title: 'Mandatory Training', message: 'All training modules below are legally required and must be completed within 5 business days.', variant: 'warning' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({}),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section2.id,
        type: 'checklist_item',
        order: 1,
        content: JSON.stringify({ label: 'Complete Workplace Health & Safety training', description: 'Available on the LMS portal. Approx. 45 minutes.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section2.id,
        type: 'checklist_item',
        order: 2,
        content: JSON.stringify({ label: 'Complete Data Privacy & Security training', description: 'Available on the LMS portal. Approx. 30 minutes.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: section2.id,
        type: 'signature',
        order: 3,
        content: JSON.stringify({ label: 'I confirm I have completed all required training', description: 'By signing below, you attest that all training has been completed honestly.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
    ],
  })

  for (const { procedureId, tagId } of [
    { procedureId: employeeOnboarding.id, tagId: tags[1].id },
    { procedureId: employeeOnboarding.id, tagId: tags[4].id },
  ]) {
    await prisma.procedureTag.upsert({ where: { procedureId_tagId: { procedureId, tagId } }, update: {}, create: { procedureId, tagId } })
  }

  const itIncident = await prisma.procedure.upsert({
    where: { id: 'proc_it_incident_001' },
    update: {},
    create: {
      id: 'proc_it_incident_001',
      workspaceId: workspace.id,
      ownerId: adminUser.id,
      title: 'IT Security Incident Response',
      description: 'Step-by-step procedure for responding to IT security incidents.',
      type: 'runsheet',
      category: 'Security',
      department: 'IT',
      status: 'published',
    },
  })

  const itVersion = await prisma.procedureVersion.upsert({
    where: { procedureId_version: { procedureId: itIncident.id, version: 1 } },
    update: {},
    create: {
      procedureId: itIncident.id,
      version: 1,
      status: 'published',
      publishedAt: new Date(),
    },
  })

  await prisma.procedure.update({ where: { id: itIncident.id }, data: { currentVersionId: itVersion.id } })

  const itSection1 = await prisma.procedureSection.create({
    data: {
      versionId: itVersion.id,
      title: 'Detection & Initial Response',
      order: 0,
      style: JSON.stringify({}),
    },
  })

  await prisma.procedureBlock.createMany({
    data: [
      {
        sectionId: itSection1.id,
        type: 'timer',
        order: 0,
        content: JSON.stringify({ label: 'Response Timer', description: 'Track time from incident detection to containment', autoStart: false }),
        style: JSON.stringify({}),
        validation: JSON.stringify({}),
        logic: JSON.stringify({}),
      },
      {
        sectionId: itSection1.id,
        type: 'dropdown',
        order: 1,
        content: JSON.stringify({ label: 'Incident Severity', options: ['Critical', 'High', 'Medium', 'Low'], placeholder: 'Select severity level' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: itSection1.id,
        type: 'long_text',
        order: 2,
        content: JSON.stringify({ label: 'Incident Description', placeholder: 'Describe what was detected, when, and how...', rows: 4 }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: itSection1.id,
        type: 'checklist_item',
        order: 3,
        content: JSON.stringify({ label: 'Notify IT Security Manager', description: 'Call or message immediately — do not wait.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
    ],
  })

  for (const { procedureId, tagId } of [
    { procedureId: itIncident.id, tagId: tags[0].id },
    { procedureId: itIncident.id, tagId: tags[2].id },
  ]) {
    await prisma.procedureTag.upsert({ where: { procedureId_tagId: { procedureId, tagId } }, update: {}, create: { procedureId, tagId } })
  }

  const draftProc = await prisma.procedure.upsert({
    where: { id: 'proc_draft_001' },
    update: {},
    create: {
      id: 'proc_draft_001',
      workspaceId: workspace.id,
      ownerId: adminUser.id,
      title: 'Server Maintenance Runsheet',
      description: 'Planned maintenance procedure for production servers.',
      type: 'runsheet',
      category: 'Operations',
      department: 'IT',
      status: 'draft',
    },
  })

  const draftVersion = await prisma.procedureVersion.upsert({
    where: { procedureId_version: { procedureId: draftProc.id, version: 1 } },
    update: {},
    create: {
      procedureId: draftProc.id,
      version: 1,
      status: 'draft',
    },
  })

  await prisma.procedure.update({ where: { id: draftProc.id }, data: { currentVersionId: draftVersion.id } })

  const draftSection = await prisma.procedureSection.create({
    data: {
      versionId: draftVersion.id,
      title: 'Pre-Maintenance Checklist',
      order: 0,
      style: JSON.stringify({}),
    },
  })

  await prisma.procedureBlock.createMany({
    data: [
      {
        sectionId: draftSection.id,
        type: 'checklist_item',
        order: 0,
        content: JSON.stringify({ label: 'Notify stakeholders of maintenance window', description: 'Send email at least 48 hours in advance.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
      {
        sectionId: draftSection.id,
        type: 'checklist_item',
        order: 1,
        content: JSON.stringify({ label: 'Backup all production databases', description: 'Verify backups are complete before proceeding.' }),
        style: JSON.stringify({}),
        validation: JSON.stringify({ required: true }),
        logic: JSON.stringify({}),
      },
    ],
  })

  for (const { procedureId, tagId } of [
    { procedureId: draftProc.id, tagId: tags[2].id },
    { procedureId: draftProc.id, tagId: tags[3].id },
  ]) {
    await prisma.procedureTag.upsert({ where: { procedureId_tagId: { procedureId, tagId } }, update: {}, create: { procedureId, tagId } })
  }

  console.log('✅ Seeding complete!')
  console.log(`   Workspace: ${workspace.name}`)
  console.log(`   Users: admin@acme.com, jane@acme.com`)
  console.log(`   Procedures: ${employeeOnboarding.title}, ${itIncident.title}, ${draftProc.title}`)
  console.log(`   Tags: Safety, HR, IT, Operations, Compliance`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
