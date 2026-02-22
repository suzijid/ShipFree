import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, boolean, index, uniqueIndex, decimal, integer, jsonb } from 'drizzle-orm/pg-core'

// ============================================================================
// Auth tables (Better-Auth managed)
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').default('client').notNull(), // 'client', 'manager', 'admin'
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

// ============================================================================
// Gradia — Project tables
// ============================================================================

export const project = pgTable(
  'project',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    managerId: text('manager_id')
      .references(() => user.id, { onDelete: 'set null' }),
    status: text('status').default('draft').notNull(),
    phase: text('phase').default('cadrage').notNull(), // ProjectPhase
    title: text('title').notNull(),
    aiSummary: jsonb('ai_summary'), // AiProjectSummary + structuredSummary
    modules: jsonb('modules').$type<{ design: boolean; works: boolean; wallet: boolean }>().default({ design: false, works: false, wallet: false }).notNull(),
    services: jsonb('services').$type<{ architect: string; contractors: string; adminHelp: string }>().default({ architect: 'no', contractors: 'no', adminHelp: 'no' }).notNull(),
    propertyType: text('property_type'),
    surface: decimal('surface', { precision: 10, scale: 2 }),
    rooms: jsonb('rooms'), // string[]
    budgetRange: text('budget_range'),
    style: text('style'),
    address: text('address'),
    postalCode: text('postal_code'),
    city: text('city'),
    totalBudget: decimal('total_budget', { precision: 12, scale: 2 }),
    progress: integer('progress').default(0).notNull(),
    matchingStatus: text('matching_status').default('open').notNull(), // 'open'|'matching'|'matched'|'in_progress'|'completed'
    paymentStatus: text('payment_status').default('pending').notNull(),
    commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }).default('0.1000'),
    warrantyExpiresAt: timestamp('warranty_expires_at'),
    stripeSessionId: text('stripe_session_id'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('project_userId_idx').on(table.userId),
    index('project_managerId_idx').on(table.managerId),
    index('project_status_idx').on(table.status),
    index('project_phase_idx').on(table.phase),
  ]
)

export const projectAction = pgTable(
  'project_action',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    phase: text('phase').notNull(), // ProjectPhase
    completed: boolean('completed').default(false).notNull(),
    isCustom: boolean('is_custom').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('projectAction_projectId_idx').on(table.projectId),
    index('projectAction_phase_idx').on(table.phase),
  ]
)

export const projectValidation = pgTable(
  'project_validation',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    phase: text('phase').notNull(), // ProjectPhase
    validatedAt: timestamp('validated_at'),
    validatedBy: text('validated_by')
      .references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('projectValidation_projectId_idx').on(table.projectId),
  ]
)

export const paymentSchedule = pgTable(
  'payment_schedule',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp('due_date').notNull(),
    status: text('status').default('pending').notNull(), // 'pending' | 'paid' | 'overdue'
    invoiceUrl: text('invoice_url'),
    paidAt: timestamp('paid_at'),
    contractorId: text('contractor_id'),
    stripeTransferId: text('stripe_transfer_id'),
    commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('paymentSchedule_projectId_idx').on(table.projectId),
    index('paymentSchedule_status_idx').on(table.status),
    index('paymentSchedule_contractorId_idx').on(table.contractorId),
  ]
)

export const message = pgTable(
  'message',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    channelId: text('channel_id'),
    senderId: text('sender_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    attachments: jsonb('attachments'), // { name: string, url: string, type: string, size: number }[]
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('message_projectId_idx').on(table.projectId),
    index('message_channelId_idx').on(table.channelId),
    index('message_senderId_idx').on(table.senderId),
    index('message_createdAt_idx').on(table.createdAt),
  ]
)

export const document = pgTable(
  'document',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    uploadedById: text('uploaded_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    mimeType: text('mime_type'),
    size: integer('size'), // bytes
    category: text('category').default('photos').notNull(), // FileCategory
    version: integer('version').default(1).notNull(),
    parentDocumentId: text('parent_document_id'), // self-reference for versioning
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('document_projectId_idx').on(table.projectId),
    index('document_uploadedById_idx').on(table.uploadedById),
    index('document_category_idx').on(table.category),
    index('document_parentDocumentId_idx').on(table.parentDocumentId),
  ]
)

export const messageChannel = pgTable(
  'message_channel',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    label: text('label').notNull(),
    type: text('type').default('public').notNull(), // 'public' | 'private_contractor'
    contractorId: text('contractor_id'), // for private channels, links to contractor
    order: integer('order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('messageChannel_projectId_idx').on(table.projectId),
    index('messageChannel_type_idx').on(table.type),
  ]
)

export const material = pgTable(
  'material',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    reference: text('reference'),
    supplier: text('supplier'),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }),
    unit: text('unit'),
    status: text('status').default('shortlisted').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('material_projectId_idx').on(table.projectId),
    index('material_category_idx').on(table.category),
    index('material_status_idx').on(table.status),
  ]
)

export const projectEvent = pgTable(
  'project_event',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'status_change', 'phase_change', 'module_activated', 'assignment', 'payment', 'note'
    data: jsonb('data'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('projectEvent_projectId_idx').on(table.projectId),
  ]
)

// ============================================================================
// Gradia — Marketplace tables
// ============================================================================

export const contractor = pgTable(
  'contractor',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    siret: text('siret'),
    specialties: jsonb('specialties').$type<string[]>().default([]).notNull(),
    serviceArea: jsonb('service_area').$type<string[]>().default([]).notNull(), // codes département
    description: text('description'),
    portfolioImages: jsonb('portfolio_images').$type<string[]>().default([]),
    certifications: jsonb('certifications').$type<string[]>().default([]),
    insuranceExpiry: timestamp('insurance_expiry'),
    stripeConnectAccountId: text('stripe_connect_account_id'),
    stripeConnectStatus: text('stripe_connect_status').default('not_started').notNull(), // 'not_started'|'onboarding'|'active'|'restricted'
    isVerified: boolean('is_verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at'),
    rating: decimal('rating', { precision: 3, scale: 2 }),
    reviewCount: integer('review_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('contractor_userId_idx').on(table.userId),
    index('contractor_stripeConnectStatus_idx').on(table.stripeConnectStatus),
    index('contractor_isVerified_idx').on(table.isVerified),
  ]
)

export const projectContractor = pgTable(
  'project_contractor',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    contractorId: text('contractor_id')
      .notNull()
      .references(() => contractor.id, { onDelete: 'cascade' }),
    specialty: text('specialty').notNull(),
    status: text('status').default('invited').notNull(), // 'invited'|'proposal_sent'|'accepted'|'rejected'|'active'|'completed'
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    assignedBy: text('assigned_by')
      .references(() => user.id, { onDelete: 'set null' }),
  },
  (table) => [
    index('projectContractor_projectId_idx').on(table.projectId),
    index('projectContractor_contractorId_idx').on(table.contractorId),
    index('projectContractor_status_idx').on(table.status),
  ]
)

export const proposal = pgTable(
  'proposal',
  {
    id: text('id').primaryKey(),
    projectContractorId: text('project_contractor_id')
      .notNull()
      .references(() => projectContractor.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    estimatedDuration: text('estimated_duration'),
    startDate: timestamp('start_date'),
    attachments: jsonb('attachments').$type<{ name: string; url: string; type: string; size: number }[]>().default([]),
    status: text('status').default('draft').notNull(), // 'draft'|'submitted'|'accepted'|'rejected'|'revised'
    submittedAt: timestamp('submitted_at'),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('proposal_projectContractorId_idx').on(table.projectContractorId),
    index('proposal_status_idx').on(table.status),
  ]
)

export const review = pgTable(
  'review',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    contractorId: text('contractor_id')
      .notNull()
      .references(() => contractor.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('review_projectId_idx').on(table.projectId),
    index('review_contractorId_idx').on(table.contractorId),
  ]
)

export const designServiceBooking = pgTable(
  'design_service_booking',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    designerId: text('designer_id')
      .references(() => contractor.id, { onDelete: 'set null' }),
    type: text('type').notNull(), // 'consultation'|'2d_plans'|'3d_renders'|'full_package'
    status: text('status').default('pending').notNull(), // 'pending'|'scheduled'|'in_progress'|'delivered'|'cancelled'
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    stripePaymentId: text('stripe_payment_id'),
    scheduledAt: timestamp('scheduled_at'),
    deliveredAt: timestamp('delivered_at'),
    deliverables: jsonb('deliverables').$type<{ name: string; url: string; type: string }[]>().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('designServiceBooking_projectId_idx').on(table.projectId),
    index('designServiceBooking_userId_idx').on(table.userId),
    index('designServiceBooking_status_idx').on(table.status),
  ]
)

// ============================================================================
// Gradia — Notifications tables
// ============================================================================

export const notification = pgTable(
  'notification',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .references(() => project.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'new_message' | 'new_proposal' | 'payment_due' | 'phase_changed' | 'document_uploaded' | 'booking_update' | 'milestone_validated' | 'system'
    title: text('title').notNull(),
    body: text('body').notNull(),
    link: text('link'), // relative URL to navigate to
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notification_userId_idx').on(table.userId),
    index('notification_read_idx').on(table.read),
    index('notification_createdAt_idx').on(table.createdAt),
    index('notification_userId_read_idx').on(table.userId, table.read),
  ]
)

export const notificationPreference = pgTable(
  'notification_preference',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(), // 'in_app' | 'email' | 'push' | 'sms'
    notificationType: text('notification_type').notNull(), // same as notification.type + 'all'
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('notificationPreference_userId_idx').on(table.userId),
    index('notificationPreference_userId_channel_type_idx').on(table.userId, table.channel, table.notificationType),
  ]
)

export const pushSubscription = pgTable(
  'push_subscription',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('pushSubscription_userId_idx').on(table.userId),
  ]
)

// ============================================================================
// Payment system tables (Stripe one-shot for Gradia)
// ============================================================================

export const customer = pgTable(
  'customer',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerCustomerId: text('provider_customer_id').notNull(),
    email: text('email'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('customer_userId_idx').on(table.userId),
    index('customer_provider_customerId_idx').on(table.providerCustomerId),
  ]
)

export const subscription = pgTable(
  'subscription',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').references(() => customer.id, { onDelete: 'set null' }),
    provider: text('provider').notNull(),
    providerSubscriptionId: text('provider_subscription_id').notNull(),
    status: text('status').notNull(),
    plan: text('plan').notNull(),
    interval: text('interval'),
    amount: decimal('amount', { precision: 10, scale: 2 }),
    currency: text('currency'),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    canceledAt: timestamp('canceled_at'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('subscription_userId_idx').on(table.userId),
    index('subscription_customerId_idx').on(table.customerId),
    index('subscription_provider_subscriptionId_idx').on(table.providerSubscriptionId),
    index('subscription_status_idx').on(table.status),
  ]
)

export const payment = pgTable(
  'payment',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').references(() => customer.id, { onDelete: 'set null' }),
    subscriptionId: text('subscription_id').references(() => subscription.id, {
      onDelete: 'set null',
    }),
    provider: text('provider').notNull(),
    providerPaymentId: text('provider_payment_id').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('payment_userId_idx').on(table.userId),
    index('payment_customerId_idx').on(table.customerId),
    index('payment_subscriptionId_idx').on(table.subscriptionId),
    index('payment_provider_paymentId_idx').on(table.providerPaymentId),
  ]
)

// ============================================================================
// Gradia — Questionnaire draft (server-side save)
// ============================================================================

export const questionnaireDraft = pgTable(
  'questionnaire_draft',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' }),
    sessionId: text('session_id'),
    currentStep: integer('current_step').default(0).notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('questionnaireDraft_userId_idx').on(table.userId),
    uniqueIndex('questionnaireDraft_sessionId_idx').on(table.sessionId),
  ]
)

// ============================================================================
// Relations
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  projects: many(project, { relationName: 'clientProjects' }),
  managedProjects: many(project, { relationName: 'managedProjects' }),
  messages: many(message),
  documents: many(document),
  contractorProfile: many(contractor),
  reviews: many(review),
  designServiceBookings: many(designServiceBooking),
  notifications: many(notification),
  notificationPreferences: many(notificationPreference),
  pushSubscriptions: many(pushSubscription),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const projectRelations = relations(project, ({ one, many }) => ({
  client: one(user, {
    fields: [project.userId],
    references: [user.id],
    relationName: 'clientProjects',
  }),
  manager: one(user, {
    fields: [project.managerId],
    references: [user.id],
    relationName: 'managedProjects',
  }),
  messages: many(message),
  documents: many(document),
  channels: many(messageChannel),
  materials: many(material),
  events: many(projectEvent),
  actions: many(projectAction),
  validations: many(projectValidation),
  paymentSchedules: many(paymentSchedule),
  projectContractors: many(projectContractor),
  reviews: many(review),
  designServiceBookings: many(designServiceBooking),
}))

export const projectActionRelations = relations(projectAction, ({ one }) => ({
  project: one(project, {
    fields: [projectAction.projectId],
    references: [project.id],
  }),
}))

export const projectValidationRelations = relations(projectValidation, ({ one }) => ({
  project: one(project, {
    fields: [projectValidation.projectId],
    references: [project.id],
  }),
  validator: one(user, {
    fields: [projectValidation.validatedBy],
    references: [user.id],
  }),
}))

export const paymentScheduleRelations = relations(paymentSchedule, ({ one }) => ({
  project: one(project, {
    fields: [paymentSchedule.projectId],
    references: [project.id],
  }),
  contractor: one(contractor, {
    fields: [paymentSchedule.contractorId],
    references: [contractor.id],
  }),
}))

export const contractorRelations = relations(contractor, ({ one, many }) => ({
  user: one(user, {
    fields: [contractor.userId],
    references: [user.id],
  }),
  projectContractors: many(projectContractor),
  reviews: many(review),
  designServiceBookings: many(designServiceBooking),
  paymentSchedules: many(paymentSchedule),
}))

export const projectContractorRelations = relations(projectContractor, ({ one, many }) => ({
  project: one(project, {
    fields: [projectContractor.projectId],
    references: [project.id],
  }),
  contractor: one(contractor, {
    fields: [projectContractor.contractorId],
    references: [contractor.id],
  }),
  assignedByUser: one(user, {
    fields: [projectContractor.assignedBy],
    references: [user.id],
  }),
  proposals: many(proposal),
}))

export const proposalRelations = relations(proposal, ({ one }) => ({
  projectContractor: one(projectContractor, {
    fields: [proposal.projectContractorId],
    references: [projectContractor.id],
  }),
}))

export const reviewRelations = relations(review, ({ one }) => ({
  project: one(project, {
    fields: [review.projectId],
    references: [project.id],
  }),
  contractor: one(contractor, {
    fields: [review.contractorId],
    references: [contractor.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}))

export const designServiceBookingRelations = relations(designServiceBooking, ({ one }) => ({
  project: one(project, {
    fields: [designServiceBooking.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [designServiceBooking.userId],
    references: [user.id],
  }),
  designer: one(contractor, {
    fields: [designServiceBooking.designerId],
    references: [contractor.id],
  }),
}))

export const messageRelations = relations(message, ({ one }) => ({
  project: one(project, {
    fields: [message.projectId],
    references: [project.id],
  }),
  channel: one(messageChannel, {
    fields: [message.channelId],
    references: [messageChannel.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}))

export const documentRelations = relations(document, ({ one }) => ({
  project: one(project, {
    fields: [document.projectId],
    references: [project.id],
  }),
  uploadedBy: one(user, {
    fields: [document.uploadedById],
    references: [user.id],
  }),
}))

export const messageChannelRelations = relations(messageChannel, ({ one, many }) => ({
  project: one(project, {
    fields: [messageChannel.projectId],
    references: [project.id],
  }),
  messages: many(message),
}))

export const materialRelations = relations(material, ({ one }) => ({
  project: one(project, {
    fields: [material.projectId],
    references: [project.id],
  }),
}))

export const projectEventRelations = relations(projectEvent, ({ one }) => ({
  project: one(project, {
    fields: [projectEvent.projectId],
    references: [project.id],
  }),
}))

export const customerRelations = relations(customer, ({ one, many }) => ({
  user: one(user, {
    fields: [customer.userId],
    references: [user.id],
  }),
  subscriptions: many(subscription),
  payments: many(payment),
}))

export const subscriptionRelations = relations(subscription, ({ one, many }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
  customer: one(customer, {
    fields: [subscription.customerId],
    references: [customer.id],
  }),
  payments: many(payment),
}))

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
  customer: one(customer, {
    fields: [payment.customerId],
    references: [customer.id],
  }),
  subscription: one(subscription, {
    fields: [payment.subscriptionId],
    references: [subscription.id],
  }),
}))

// ── Notification relations ─────────────────────────────────────────────────

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [notification.projectId],
    references: [project.id],
  }),
}))

export const notificationPreferenceRelations = relations(notificationPreference, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreference.userId],
    references: [user.id],
  }),
}))

export const pushSubscriptionRelations = relations(pushSubscription, ({ one }) => ({
  user: one(user, {
    fields: [pushSubscription.userId],
    references: [user.id],
  }),
}))

export const questionnaireDraftRelations = relations(questionnaireDraft, ({ one }) => ({
  user: one(user, {
    fields: [questionnaireDraft.userId],
    references: [user.id],
  }),
}))
