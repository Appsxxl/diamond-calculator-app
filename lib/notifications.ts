/**
 * Contact Moment Notification Service
 *
 * Schedules local push notifications for each partner's key dates:
 * - 90-day audit (day 90 from start)
 * - 11-month decision (day 335 from start)
 * - 30 days to cycle end (day 335 from start, same window)
 * - 12-month cycle end (day 365 from start)
 * - Rebate ready: monthly on the 1st of each month
 *
 * Notifications are scheduled at 9:00 AM on the trigger date.
 * All previously scheduled notifications for a partner are cancelled
 * before rescheduling to avoid duplicates.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  amount: number;
  contactMoments: string[];
}

// ─── Permission Request ───────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("contact-moments", {
      name: "Contact Moment Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#38bdf8",
      sound: "default",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Setup Notification Handler ───────────────────────────────────────────────

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ─── Schedule Notifications for a Partner ────────────────────────────────────

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr + "T09:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

export async function schedulePartnerNotifications(
  partner: Partner,
  labels: {
    alertRebate: string;
    alert90day: string;
    alert11month: string;
    alert30day: string;
    alert12month: string;
  }
) {
  if (Platform.OS === "web") return;

  const enabled =
    partner.contactMoments && partner.contactMoments.length > 0
      ? partner.contactMoments
      : ["alertRebate", "alert90day", "alert11month", "alert30day", "alert12month"];

  const now = new Date();

  const schedule = async (tag: string, date: Date, title: string, body: string) => {
    if (!enabled.includes(tag)) return;
    if (date <= now) return; // past date — skip

    await Notifications.scheduleNotificationAsync({
      identifier: `partner-${partner.id}-${tag}`,
      content: {
        title,
        body,
        sound: "default",
        data: { partnerId: partner.id, alertType: tag },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  };

  // 90-day audit
  await schedule(
    "alert90day",
    addDays(partner.startDate, 90),
    `📋 ${partner.name}`,
    labels.alert90day
  );

  // 11-month decision (day 335)
  await schedule(
    "alert11month",
    addDays(partner.startDate, 335),
    `📅 ${partner.name}`,
    labels.alert11month
  );

  // 30 days to cycle end (day 335, same as 11-month — both fire together)
  await schedule(
    "alert30day",
    addDays(partner.startDate, 335),
    `⏰ ${partner.name}`,
    labels.alert30day
  );

  // 12-month cycle end (day 365)
  await schedule(
    "alert12month",
    addDays(partner.startDate, 365),
    `🔴 ${partner.name}`,
    labels.alert12month
  );

  // Rebate ready: schedule for the 1st of next month (and every month after)
  if (enabled.includes("alertRebate")) {
    const estimatedRebate = Math.round(partner.amount * 0.03);
    if (estimatedRebate >= 100) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
      await Notifications.scheduleNotificationAsync({
        identifier: `partner-${partner.id}-alertRebate`,
        content: {
          title: `💰 ${partner.name}`,
          body: `${labels.alertRebate} ~$${estimatedRebate}/mo`,
          sound: "default",
          data: { partnerId: partner.id, alertType: "alertRebate" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          day: 1,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    }
  }
}

// ─── Cancel Notifications for a Partner ──────────────────────────────────────

export async function cancelPartnerNotifications(partnerId: string) {
  if (Platform.OS === "web") return;

  const tags = ["alertRebate", "alert90day", "alert11month", "alert30day", "alert12month"];
  for (const tag of tags) {
    await Notifications.cancelScheduledNotificationAsync(`partner-${partnerId}-${tag}`).catch(
      () => {}
    );
  }
}

// ─── Cancel All Partner Notifications ────────────────────────────────────────

export async function cancelAllPartnerNotifications() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
