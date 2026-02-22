/**
 * SMS Notification Service — Placeholder
 *
 * This module provides the structure for SMS notifications.
 * Actual Twilio/SMS integration is deferred.
 * The phone field already exists on the user table.
 */

import { eq } from 'drizzle-orm'
import { db } from '@/database'
import { user, notificationPreference } from '@/database/schema'
import { notificationService } from './notification-service'
import type { NotificationType } from './notification-service'

/**
 * Send an SMS notification to a user.
 * Checks notification preferences before sending.
 * Currently logs the message instead of actually sending via Twilio.
 */
export const sendSmsNotification = async (
  userId: string,
  type: NotificationType,
  message: string
): Promise<void> => {
  try {
    // Check if SMS is enabled for this user and type
    const enabled = await notificationService.isChannelEnabled(userId, 'sms', type)
    if (!enabled) return

    // Get user's phone number
    const [u] = await db
      .select({ phone: user.phone, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!u?.phone) {
      return
    }

    // Placeholder: log instead of actually sending
    // In production, integrate Twilio:
    // import twilio from 'twilio'
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: u.phone,
    // })

    console.info(`[sms] Would send SMS to ${u.phone} (${u.name}): ${message}`)
  } catch (err) {
    console.error('[sms] Failed to send SMS notification:', err)
  }
}
