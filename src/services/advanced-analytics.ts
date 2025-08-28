import { Application, AnalyticsData } from '@/types/enhanced-application';

export class AdvancedAnalyticsService {
  // Calculate comprehensive analytics
  calculateComprehensiveAnalytics(applications: Application[]): AnalyticsData {
    const total = applications.length;
    const statusCounts = this.getStatusCounts(applications);
    const successRate = total > 0 ? (statusCounts.accepted / total) * 100 : 0;
    
    return {
      successRate,
      averageProcessingTime: this.calculateAverageProcessingTime(applications),
      mostAppliedUniversities: this.getMostAppliedUniversities(applications),
      statusDistribution: statusCounts,
      deadlineProximity: this.calculateDeadlineProximity(applications)
    };
  }

  // Calculate processing time for each application
  calculateAverageProcessingTime(applications: Application[]): number {
    const completed = applications.filter(a => 
      ['accepted', 'rejected', 'waitlisted'].includes(a.status)
    );
    
    if (completed.length === 0) return 0;
    
    const totalDays = completed.reduce((sum, app) => {
      if (app.submittedDate && app.createdAt) {
        const days = Math.ceil(
          (app.submittedDate.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }
      return sum;
    }, 0);
    
    return Math.round(totalDays / completed.length);
  }

  // Get status distribution
  getStatusCounts(applications: Application[]): Record<string, number> {
    const distribution: Record<string, number> = {
      pending: 0,
      submitted: 0,
      'under-review': 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
      dpwas: 0,
      waitlist: 0
    };
    
    applications.forEach(app => {
      distribution[app.status] = (distribution[app.status] || 0) + 1;
    });
    
    return distribution;
  }

  // Calculate deadline proximity
  calculateDeadlineProximity(applications: Application[]): {
    urgent: number;
    soon: number;
    later: number;
  } {
    const now = new Date();
    const urgent = applications.filter(a => 
      a.program.deadline.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    
    const soon = applications.filter(a => {
      const daysLeft = (a.program.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft >= 7 && daysLeft <= 30;
    }).length;
    
    const later = applications.filter(a => 
      (a.program.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) > 30
    ).length;
    
    return { urgent, soon, later };
  }

  // Get most applied universities
  getMostAppliedUniversities(applications: Application[]): Array<{ university: string; count: number }> {
    const counts: Record<string, number> = {};
    applications.forEach(app => {
      counts[app.university.name] = (counts[app.university.name] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([university, count]) => ({ university, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Calculate acceptance probability
  calculateAcceptanceProbability(application: Application, allApplications: Application[]): number {
    const sameUniversity = allApplications.filter(a => a.university.id === application.university.id);
    const accepted = sameUniversity.filter(a => a.status === 'accepted').length;
    const total = sameUniversity.length;
    
    return total > 0 ? (accepted / total) * 100 : 0;
  }

  // Get timeline analysis
  getTimelineAnalysis(applications: Application[]): {
    averageDaysToSubmit: number;
    averageDaysToDecision: number;
    fastestApplication: Application | null;
    slowestApplication: Application | null;
  } {
    const submitted = applications.filter(a => a.submittedDate);
    const decided = applications.filter(a => ['accepted', 'rejected'].includes(a.status));
    
    const avgDaysToSubmit = submitted.length > 0
      ? submitted.reduce((sum, app) => {
          if (app.submittedDate && app.createdAt) {
            return sum + Math.ceil((app.submittedDate.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0) / submitted.length
      : 0;
    
    const avgDaysToDecision = decided.length > 0
      ? decided.reduce((sum, app) => {
          if (app.updatedAt && app.submittedDate) {
            return sum + Math.ceil((app.updatedAt.getTime() - app.submittedDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0) / decided.length
      : 0;
    
    return {
      averageDaysToSubmit: Math.round(avgDaysToSubmit),
      averageDaysToDecision: Math.round(avgDaysToDecision),
      fastestApplication: null,
      slowestApplication: null
    };
  }

  // Get document completion rate
  getDocumentCompletionRate(applications: Application[]): number {
    const totalDocuments = applications.reduce((sum, app) => sum + app.documents.length, 0);
    const completedDocuments = applications.reduce((sum, app) => 
      sum + app.documents.filter(d => d.status === 'submitted' || d.status === 'verified').length, 0
    );
    
    return totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;
  }

  // Get financial aid statistics
  getFinancialAidStatistics(applications: Application[]): {
    totalAidApplied: number;
    totalAidApproved: number;
    averageAidAmount: number;
    topAidPrograms: Array<{ name: string; amount: number }>;
  } {
    const allAid = applications.flatMap(a => a.financialAid);
    const approvedAid = allAid.filter(aid => aid.status === 'approved');
    
    const totalAmount = approvedAid.reduce((sum, aid) => sum + (aid.amount || 0), 0);
    
    return {
      totalAidApplied: allAid.length,
      totalAidApproved: approvedAid.length,
      averageAidAmount: approvedAid.length > 0 ? totalAmount / approvedAid.length : 0,
      topAidPrograms: approvedAid
        .map(aid => ({ name: aid.name, amount: aid.amount || 0 }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
    };
  }
}
