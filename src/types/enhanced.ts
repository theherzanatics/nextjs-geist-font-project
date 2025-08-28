import { EnhancedReminder, NotificationSettings } from '@/types/enhanced';

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    email: true,
    push: true,
    sms: false,
    reminderDays: [7, 3, 1],
    quietHours: {
      start: '22:00',
      end: '08:00',
    },
  };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async scheduleReminder(reminder: EnhancedReminder): Promise<void> {
    if (this.isInQuietHours()) {
      console.log('Notification scheduled for quiet hours, will send later');
      return;
    }

    const notification = {
      title: this.getNotificationTitle(reminder.type),
      body: reminder.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: reminder.id,
      data: {
        reminderId: reminder.id,
        type: reminder.type,
      },
    };

    if (this.settings.push && 'Notification' in window && 'serviceWorker' in navigator) {
      await this.sendPushNotification(notification);
    }

    if (this.settings.email) {
      await this.sendEmailNotification(reminder);
    }
  }

  private async sendPushNotification(notification: any): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, notification);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private async sendEmailNotification(reminder: EnhancedReminder): Promise<void> {
    // This would integrate with an email service like EmailJS or SendGrid
    console.log(`Email notification: ${reminder.message}`);
  }

  private getNotificationTitle(type: EnhancedReminder['type']): string {
    const titles = {
      deadline: '📅 Deadline Reminder',
      document: '📄 Document Required',
      interview: '🎤 Interview Scheduled',
      result: '📊 Result Available',
      'financial-aid': '💰 Financial Aid Update',
    };
    return titles[type];
  }
