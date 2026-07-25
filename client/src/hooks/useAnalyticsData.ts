import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface RedFlag {
  clause: string;
  risk: 'High' | 'Medium' | 'Safe';
  explanation: string;
  suggestedScript?: string;
}

interface AnalysisResult {
  summary: string;
  redFlags: RedFlag[];
  negotiationSuggestions: string[];
  clauses: { title: string; explanation: string }[];
  jargons?: { term: string; definition: string }[];
  personaExplanation: string;
}

interface AnalysisDoc {
  id: string;
  userId: string;
  fileName: string;
  persona: string;
  result: AnalysisResult;
  createdAt: { seconds: number };
}

export interface AnalyticsData {
  totalAnalyses: number;
  avgRiskScore: number;
  safeRate: number;
  riskDistribution: { high: number; medium: number; safe: number };
  personaPopularity: { persona: string; count: number; percent: number }[];
  activityTimeline: { week: string; count: number }[];
  topRedFlags: { clause: string; risk: string; count: number }[];
}

function calculateRiskScore(redFlags: RedFlag[]): number {
  if (!redFlags || redFlags.length === 0) return 0;
  const highCount = redFlags.filter(f => f.risk === 'High').length;
  const mediumCount = redFlags.filter(f => f.risk === 'Medium').length;
  const score = (highCount * 35) + (mediumCount * 15);
  return Math.min(score, 100);
}

function getWeekLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function useAnalyticsData() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndCompute = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const analyses = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AnalysisDoc[];

        if (analyses.length === 0) {
          setData({
            totalAnalyses: 0,
            avgRiskScore: 0,
            safeRate: 0,
            riskDistribution: { high: 0, medium: 0, safe: 0 },
            personaPopularity: [],
            activityTimeline: [],
            topRedFlags: [],
          });
          return;
        }

        // Total analyses
        const totalAnalyses = analyses.length;

        // Risk scores per analysis
        const riskScores = analyses.map(a => calculateRiskScore(a.result?.redFlags || []));
        const avgRiskScore = Math.round(riskScores.reduce((a, b) => a + b, 0) / totalAnalyses);

        // Safe rate (analyses with no high-risk flags)
        const safeCount = analyses.filter(a =>
          !a.result?.redFlags?.some(rf => rf.risk === 'High')
        ).length;
        const safeRate = Math.round((safeCount / totalAnalyses) * 100);

        // Risk distribution (count all red flags by risk level)
        let high = 0, medium = 0, safe = 0;
        analyses.forEach(a => {
          a.result?.redFlags?.forEach(rf => {
            if (rf.risk === 'High') high++;
            else if (rf.risk === 'Medium') medium++;
            else safe++;
          });
        });

        // Persona popularity
        const personaCounts: Record<string, number> = {};
        analyses.forEach(a => {
          const p = a.persona || 'Unknown';
          personaCounts[p] = (personaCounts[p] || 0) + 1;
        });
        const personaPopularity = Object.entries(personaCounts)
          .map(([persona, count]) => ({
            persona,
            count,
            percent: Math.round((count / totalAnalyses) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        // Activity timeline (group by week, last 8 weeks)
        const now = new Date();
        const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
        const weeklyData: Record<string, number> = {};

        // Initialize all weeks
        for (let i = 0; i < 8; i++) {
          const weekDate = new Date(eightWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          const label = getWeekLabel(weekDate);
          weeklyData[label] = 0;
        }

        analyses.forEach(a => {
          if (a.createdAt?.seconds) {
            const date = new Date(a.createdAt.seconds * 1000);
            if (date >= eightWeeksAgo) {
              const label = getWeekLabel(date);
              if (label in weeklyData) {
                weeklyData[label]++;
              }
            }
          }
        });

        const activityTimeline = Object.entries(weeklyData).map(([week, count]) => ({
          week,
          count,
        }));

        // Top red flags (most common clause texts)
        const clauseCounts: Record<string, { risk: string; count: number }> = {};
        analyses.forEach(a => {
          a.result?.redFlags?.forEach(rf => {
            const key = rf.clause?.substring(0, 80) || 'Unknown clause';
            if (!clauseCounts[key]) {
              clauseCounts[key] = { risk: rf.risk, count: 0 };
            }
            clauseCounts[key].count++;
          });
        });

        const topRedFlags = Object.entries(clauseCounts)
          .map(([clause, { risk, count }]) => ({ clause, risk, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setData({
          totalAnalyses,
          avgRiskScore,
          safeRate,
          riskDistribution: { high, medium, safe },
          personaPopularity,
          activityTimeline,
          topRedFlags,
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCompute();
  }, [user]);

  return { data, isLoading };
}
