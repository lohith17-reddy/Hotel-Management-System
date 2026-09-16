import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';
import { DashboardStats } from '../../types/index.ts';
import { AdminDashboard } from './AdminDashboard.tsx';
import { WardenDashboard } from './WardenDashboard.tsx';
import { StudentDashboard } from './StudentDashboard.tsx';
import { StaffDashboard } from './StaffDashboard.tsx';

interface OverviewDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ setActiveTab, onOpenAI }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const role = currentUser?.role || 'admin';

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.getHostelAIInsights();
      if (res.success) {
        setAiInsights(res.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (role === 'admin') {
      fetchAIInsights();
    }
  }, [currentUser?.id, role]);

  if (role === 'student') {
    return (
      <StudentDashboard
        stats={stats}
        setActiveTab={setActiveTab}
        onOpenAI={onOpenAI}
      />
    );
  }

  if (role === 'warden') {
    return (
      <WardenDashboard
        stats={stats}
        setActiveTab={setActiveTab}
        onOpenAI={onOpenAI}
      />
    );
  }

  if (role === 'staff') {
    return (
      <StaffDashboard
        stats={stats}
        setActiveTab={setActiveTab}
        onOpenAI={onOpenAI}
      />
    );
  }

  return (
    <AdminDashboard
      stats={stats}
      aiInsights={aiInsights}
      isAiLoading={isAiLoading}
      onRefreshAI={fetchAIInsights}
      setActiveTab={setActiveTab}
      onOpenAI={onOpenAI}
    />
  );
};
