import { Application, ApplicationStatus } from '@/types/application';

export interface FilterOptions {
  searchTerm?: string;
  status?: ApplicationStatus | 'all';
  universityType?: 'public' | 'private' | 'all';
  deadlineRange?: {
    start: Date;
    end: Date;
  };
  applicationFeeRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'deadline' | 'status' | 'university' | 'program' | 'fee';
  sortOrder?: 'asc' | 'desc';
}

export class FilterService {
  static filterApplications(applications: Application[], options: FilterOptions): Application[] {
    let filtered = [...applications];

    // Search filter
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.university.name.toLowerCase().includes(term) ||
        app.program.name.toLowerCase().includes(term) ||
        app.university.location.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(app => app.status === options.status);
    }

    // University type filter
    if (options.universityType && options.universityType !== 'all') {
      filtered = filtered.filter(app => app.university.type === options.universityType);
    }

    // Deadline range filter
    if (options.deadlineRange) {
      filtered = filtered.filter(app => 
        app.program.deadline >= options.deadlineRange!.start &&
        app.program.deadline <= options.deadlineRange!.end
      );
    }

    // Application fee range filter
    if (options.applicationFeeRange) {
      filtered = filtered.filter(app => 
        app.program.applicationFee >= options.applicationFeeRange!.min &&
        app.program.applicationFee <= options.applicationFeeRange!.max
      );
    }

    return filtered;
  }

  static sortApplications(applications: Application[], sortBy: string, sortOrder: 'asc' | 'desc'): Application[] {
    const sorted = [...applications];

    switch (sortBy) {
      case 'deadline':
        sorted.sort((a, b) => {
          const result = a.program.deadline.getTime() - b.program.deadline.getTime();
          return sortOrder === 'asc' ? result : -result;
        });
        break;
      case 'status':
        sorted.sort((a, b) => {
          const result = a.status.localeCompare(b.status);
          return sortOrder === 'asc' ? result : -result;
        });
        break;
      case 'university':
        sorted.sort((a, b) => {
          const result = a.university.name.localeCompare(b.university.name);
          return sortOrder === 'asc' ? result : -result;
        });
        break;
      case 'program':
        sorted.sort((a, b) => {
          const result = a.program.name.localeCompare(b.program.name);
          return sortOrder === 'asc' ? result : -result;
        });
        break;
      case 'fee':
        sorted.sort((a, b) => {
          const result = a.program.applicationFee - b.program.applicationFee;
          return sortOrder === 'asc' ? result : -result;
        });
        break;
    }

    return sorted;
  }

  static getUpcomingDeadlines(applications: Application[], daysAhead: number = 30): Application[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return applications
      .filter(app => app.status === 'pending' || app.status === 'submitted')
      .filter(app => app.program.deadline <= cutoff)
      .sort((a, b) => a.program.deadline.getTime() - b.program.deadline.getTime());
  }

  static getStats(applications: Application[]) {
    const stats = {
      total: applications.length,
      pending: 0,
      submitted: 0,
      'under-review': 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
      dpwas: 0,
      waitlist: 0,
      upcomingDeadlines: 0,
      overdue: 0
    };

    const now = new Date();
    
    applications.forEach(app => {
      stats[app.status]++;
      
      if (app.status === 'pending' || app.status === 'submitted') {
        const daysUntil = Math.ceil((app.program.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7 && daysUntil >= 0) stats.upcomingDeadlines++;
        if (daysUntil < 0) stats.overdue++;
      }
    });

    return stats;
  }
}
