import { useState, useEffect } from 'react';
import { Application, Document, Interview, FinancialAid } from '@/types/enhanced-application';

export const useEnhancedApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await fetch('/api/applications').then(res => res.json());
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addApplication = async (application: Partial<Application>) => {
    try {
      const newApplication: Application = {
        id: crypto.randomUUID(),
        ...application,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: [],
        reminders: [],
        interviews: [],
        financialAid: [],
        checklist: {},
        priority: 'regular',
        applicationFeePaid: false,
        applicationFeeAmount: 0
      };
      
      // Implementation would save to Firebase
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (err) {
      throw new Error('Failed to add application');
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status, updatedAt: new Date() } : app
      )
    );
  };

  const addDocument = async (applicationId: string, document: Document) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, documents: [...app.documents, document], updatedAt: new Date() }
          : app
      )
    );
  };

  const addInterview = async (applicationId: string, interview: Interview) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, interviews: [...app.interviews, interview], updatedAt: new Date() }
          : app
      )
    );
  };

  const getAnalytics = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      waitlisted: applications.filter(a => a.status === 'waitlisted').length,
      dpwas: applications.filter(a => a.status === 'dpwas').length,
      waitlist: applications.filter(a => a.status === 'waitlist').length
    };

    return {
      ...stats,
      successRate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
      averageProcessingTime: 0 // Calculate based on actual data
    };
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplicationStatus,
    addDocument,
    addInterview,
    getAnalytics
  };
};
