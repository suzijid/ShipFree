import { eq, and, desc, sql, count } from 'drizzle-orm'

import { db } from '@/database'
import {
  notification,
  notificationPreference,
  project,
  projectContractor,
  contractor,
  user,
} from '@/database/schema'
import { sendEmail } from '@/lib/messaging/email'
import { getFromEmailAddress } from '@/lib/messaging/email/utils'

// ── Types ─────────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  'new_message',
  'new_proposal',
  'payment_due',
  'phase_changed',
  'document_uploaded',
  'booking_update',
  'milestone_validated',
  'system',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_CHANNELS = ['in_app', 'email', 'push', 'sms'] as const

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_message: 'Nouveau message',
  new_proposal: 'Nouveau devis',
  payment_due: 'Paiement en attente',
  phase_changed: 'Changement de phase',
  document_uploaded: 'Document ajouté',
  booking_update: 'Mise à jour réservation',
  milestone_validated: 'Jalon validé',
  system: 'Système',
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
  sms: 'SMS',
}

interface CreateNotificationParams {
  userId: string
  projectId?: string
  type: NotificationType
  title: string
  body: string
  link?: string
}

interface CreateForProjectParams {
  projectId: string
  type: NotificationType
  title: string
  body: string
  link?: string
  excludeUserId?: string
}

// ── Service ───────────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Create a notification for a single user.
   */
  async create(params: CreateNotificationParams): Promise<string> {
    const id = crypto.randomUUID()
    await db.insert(notification).values({
      id,
      userId: params.userId,
      projectId: params.projectId ?? null,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
      read: false,
    })
    return id
  }

  /**
   * Create notifications for all project members (owner + manager + contractors),
   * optionally excluding a specific user (e.g. the sender).
   */
  async createForProject(params: CreateForProjectParams): Promise<void> {
    const [p] = await db
      .select({
        userId: project.userId,
        managerId: project.managerId,
      })
      .from(project)
      .where(eq(project.id, params.projectId))
      .limit(1)

    if (!p) return

    const memberIds = new Set<string>()

    // Add project owner
    memberIds.add(p.userId)

    // Add project manager if assigned
    if (p.managerId) {
      memberIds.add(p.managerId)
    }

    // Add all contractors assigned to the project
    const contractors = await db
      .select({ userId: contractor.userId })
      .from(projectContractor)
      .innerJoin(contractor, eq(contractor.id, projectContractor.contractorId))
      .where(eq(projectContractor.projectId, params.projectId))

    for (const c of contractors) {
      memberIds.add(c.userId)
    }

    // Exclude sender if specified
    if (params.excludeUserId) {
      memberIds.delete(params.excludeUserId)
    }

    // Create notifications in batch
    if (memberIds.size > 0) {
      const values = Array.from(memberIds).map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        projectId: params.projectId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link ?? null,
        read: false,
      }))

      await db.insert(notification).values(values)
    }
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, userId)
        )
      )
    return true
  }

  /**
   * Mark all notifications for a user as read.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.userId, userId),
          eq(notification.read, false)
        )
      )
  }

  /**
   * Get the count of unread notifications for a user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notification)
      .where(
        and(
          eq(notification.userId, userId),
          eq(notification.read, false)
        )
      )
    return result?.count ?? 0
  }

  /**
   * Get paginated notifications for a user.
   */
  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: (typeof notification.$inferSelect)[]; total: number; unreadCount: number }> {
    const offset = (page - 1) * limit

    const [notifications, [totalResult], unreadCount] = await Promise.all([
      db
        .select()
        .from(notification)
        .where(eq(notification.userId, userId))
        .orderBy(desc(notification.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(notification)
        .where(eq(notification.userId, userId)),
      this.getUnreadCount(userId),
    ])

    return {
      notifications,
      total: totalResult?.count ?? 0,
      unreadCount,
    }
  }

  /**
   * Delete a notification (must belong to the user).
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    await db
      .delete(notification)
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, userId)
        )
      )
    return true
  }

  /**
   * Get user notification preferences.
   * Returns all saved preferences. Defaults are applied client-side.
   */
  async getUserPreferences(userId: string) {
    return db
      .select()
      .from(notificationPreference)
      .where(eq(notificationPreference.userId, userId))
  }

  /**
   * Check if a notification channel is enabled for a user and type.
   * If no preference exists, defaults to enabled for in_app and email,
   * disabled for push and sms.
   */
  async isChannelEnabled(
    userId: string,
    channel: string,
    type: string
  ): Promise<boolean> {
    // Check specific type preference
    const [pref] = await db
      .select()
      .from(notificationPreference)
      .where(
        and(
          eq(notificationPreference.userId, userId),
          eq(notificationPreference.channel, channel),
          eq(notificationPreference.notificationType, type)
        )
      )
      .limit(1)

    if (pref) return pref.enabled

    // Check 'all' preference for this channel
    const [allPref] = await db
      .select()
      .from(notificationPreference)
      .where(
        and(
          eq(notificationPreference.userId, userId),
          eq(notificationPreference.channel, channel),
          eq(notificationPreference.notificationType, 'all')
        )
      )
      .limit(1)

    if (allPref) return allPref.enabled

    // Default: enabled for in_app and email, disabled for push and sms
    return channel === 'in_app' || channel === 'email'
  }

  /**
   * Attempt to send an email notification.
   * Checks user preferences before sending.
   */
  async sendEmail(
    userId: string,
    type: NotificationType,
    data: { subject: string; html: string }
  ): Promise<void> {
    const enabled = await this.isChannelEnabled(userId, 'email', type)
    if (!enabled) return

    // Get user email
    const [u] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!u) return

    await sendEmail({
      to: u.email,
      subject: data.subject,
      html: data.html,
      from: getFromEmailAddress(),
      emailType: 'transactional',
    })
  }
}

export const notificationService = new NotificationService()
