import { useState, useEffect } from 'react';
import { Application, ApplicationStats } from '@/types/application';

const STORAGE_KEY = 'college-tracker-applications';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplications = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setApplications(parsed.map((app: any) => ({
            ...app,
            program: {
              ...app.program,
              deadline: new Date(app.program.deadline),
            },
            submittedDate: app.submittedDate ? new Date(app.submittedDate) : undefined,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt),
          })));
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const saveApplications = (newApplications: Application[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newApplications));
      setApplications(newApplications);
    } catch (error) {
      console.error('Failed to save applications:', error);
    }
  };

  const addApplication = (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApplication: Application = {
      ...application,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveApplications([...applications, newApplication]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const updated = applications.map(app =>
      app.id === id
        ? { ...app, ...updates, updatedAt: new Date() }
        : app
    );
    saveApplications(updated);
  };

  const deleteApplication = (id: string) => {
    saveApplications(applications.filter(app => app.id !== id));
  };

  const getStats = (): ApplicationStats => {
    const stats = applications.reduce(
      (acc, app) => {
        acc.total++;
        acc[app.status]++;
        return acc;
      },
      { total: 0, pending: 0, submitted: 0, 'under-review': 0, accepted: 0, rejected: 0, waitlisted: 0, dpwas: 0, waitlist: 0 }
    );
    return stats;
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return applications
      .filter(app => app.status === 'pending' || app.status === 'submitted')
      .filter(app => app.program.deadline <= thirtyDaysFromNow)
      .sort((a, b) => a.program.deadline.getTime() - b.program.deadline.getTime());
  };

  return {
    applications,
    isLoading,
    addApplication,
    updateApplication,
    deleteApplication,
    getStats,
    getUpcomingDeadlines,
  };
}
