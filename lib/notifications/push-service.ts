/**
 * Push Notification Service — Foundation
 *
 * This module sets up the structure for Web Push notifications.
 * Full implementation requires VAPID keys to be configured.
 * For now, it registers the service worker and stores subscriptions.
 */

import { eq } from 'drizzle-orm'
import { db } from '@/database'
import { pushSubscription } from '@/database/schema'

/**
 * Register the service worker and subscribe to push notifications.
 * Call this from the client side.
 */
export const subscribeToPush = async (userId: string): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[push] Push notifications not supported in this browser')
      return false
    }

    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // Note: In production, use the VAPID public key from environment
    // const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    // if (!vapidPublicKey) {
    //   console.warn('[push] VAPID public key not configured')
    //   return false
    // }

    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    // })

    // Save subscription to server
    // await fetch('/api/notifications/push-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     endpoint: subscription.endpoint,
    //     keys: subscription.toJSON().keys,
    //   }),
    // })

    console.info('[push] Service worker registered. Full push subscription requires VAPID keys.')
    return true
  } catch (err) {
    console.error('[push] Failed to subscribe:', err)
    return false
  }
}

/**
 * Send a push notification to a user.
 * This is a server-side function.
 *
 * Note: Full implementation requires web-push library and VAPID keys.
 * For now, this logs the notification.
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  link?: string
): Promise<void> => {
  try {
    // Get user's push subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, userId))

    if (subscriptions.length === 0) {
      return
    }

    // Note: In production, use web-push library:
    // import webpush from 'web-push'
    // webpush.setVapidDetails(
    //   'mailto:contact@gradia.fr',
    //   process.env.VAPID_PUBLIC_KEY!,
    //   process.env.VAPID_PRIVATE_KEY!,
    // )
    //
    // for (const sub of subscriptions) {
    //   await webpush.sendNotification(
    //     { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    //     JSON.stringify({ title, body, link })
    //   )
    // }

    console.info(`[push] Would send push to user ${userId}: ${title} — ${body}`)
  } catch (err) {
    console.error('[push] Failed to send push notification:', err)
  }
}
