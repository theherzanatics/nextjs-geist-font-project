import { Application } from '@/types/application';

const STORAGE_KEY = 'college-tracker-applications';
const BACKUP_KEY = 'college-tracker-backup';

export interface StorageService {
  saveApplications: (applications: Application[]) => Promise<void>;
  loadApplications: () => Promise<Application[]>;
  backupApplications: (applications: Application[]) => Promise<void>;
  restoreApplications: () => Promise<Application[] | null>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

export const storageService: StorageService = {
  async saveApplications(applications: Application[]): Promise<void> {
    try {
      const serialized = JSON.stringify(applications, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      localStorage.setItem(STORAGE_KEY, serialized);
      
      // Also create a backup
      const backup = JSON.stringify({
        applications,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
      localStorage.setItem(BACKUP_KEY, backup);
    } catch (error) {
      console.error('Failed to save applications:', error);
    }
  },

  async loadApplications(): Promise<Application[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored, (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          return new Date(value);
        }
        return value;
      });
      
      return parsed || [];
    } catch (error) {
      console.error('Failed to load applications:', error);
      return [];
    }
  },

  async backupApplications(applications: Application[]): Promise<void> {
    try {
      const backup = {
        applications,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to backup applications:', error);
    }
  },

  async restoreApplications(): Promise<Application[] | null> {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (!backup) return null;
      
      const parsed = JSON.parse(backup);
      return parsed.applications || null;
    } catch (error) {
      console.error('Failed to restore applications:', error);
      return null;
    }
  },

  async exportData(): Promise<string> {
    try {
      const applications = await storageService.loadApplications();
      return JSON.stringify({
        applications,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  },

  async importData(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      if (parsed.applications) {
        await storageService.saveApplications(parsed.applications);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  }
};
