import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FileText, Calendar, ChevronRight, Search, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const History = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useDocumentTitle('Analysis History - ContractChill');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setHistory(results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteDoc(doc(db, 'analyses', id));
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success('History deleted successfully', { description: 'The analysis has been removed from your account.' });
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete history');
      }
    }
  };

  const filtered = history?.filter(item => {
    const matchesSearch = item.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'High Risk') {
      matchesFilter = item.result?.redFlags?.some((rf: any) => rf.risk === 'High');
    } else if (activeFilter === 'Safe') {
      matchesFilter = !item.result?.redFlags?.some((rf: any) => rf.risk === 'High');
    } else if (activeFilter !== 'All') {
      matchesFilter = item.persona === activeFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const groupedFiltered = filtered?.reduce((acc: any, item: any) => {
    let group = 'Earlier';
    if (item.createdAt?.seconds) {
      const date = new Date(item.createdAt.seconds * 1000);
      const now = new Date();
      
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
      
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (isToday) group = 'Today';
      else if (isYesterday) group = 'Yesterday';
      else if (diffDays <= 7) group = 'This week';
    } else {
      group = 'Today';
    }
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'This week', 'Earlier'];



  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      {/* Header with summary bar */}
      <div className="flex flex-col gap-3">
        <div>
           <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.05em] text-text">Analysis history</h1>
          <p className="text-text-muted text-sm mt-1">Review all your previous contract analyses.</p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {isLoading ? (
            <>
              <div className="h-7 w-20 bg-surface-2 rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-surface-2 rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-surface-2 rounded-full animate-pulse" />
            </>
          ) : (
            [
              {
                label: `${history.length} total`,
                color: 'text-text-subtle',
                bg: 'bg-surface border-border',
              },
              {
                label: `${history.filter(i => i.result?.redFlags?.some((rf: any) => rf.risk === 'High')).length} high risk`,
                color: 'text-red-500',
                bg: 'bg-red-500/8 border-red-500/20',
              },
              {
                label: `${history.filter(i => !i.result?.redFlags?.some((rf: any) => rf.risk === 'High')).length} safe`,
                color: 'text-green-600',
                bg: 'bg-green-500/8 border-green-500/20',
              },
            ].map((pill, i) => (
              <span
                key={i}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${pill.bg} ${pill.color}`}
              >
                {pill.label}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 bg-surface transition-[border-color,box-shadow] duration-150 text-sm font-medium border-border hover:border-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1 min-w-0">
            {['All', 'High Risk', 'Safe', 'Chill Friend', 'Angry Lawyer', 'Corporate Mentor', 'Freelancer Senior'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                 className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-[background-color,border-color,color,transform] duration-150 ${
                  activeFilter === f 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 border border-primary' 
                    : 'bg-surface border border-border text-text-subtle hover:text-text hover:border-primary/30'
                }`}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>
          
          {/* Dynamic Result Count */}
          {(searchQuery || activeFilter !== 'All') && (
            <div className="text-[10px] font-bold text-text-subtle whitespace-nowrap shrink-0 mt-[-4px]">
              showing <span className="text-primary">{filtered.length}</span> of {history.length}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-xl bg-surface-2 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                    <div className="h-4 bg-surface-2 rounded-md animate-pulse w-3/4" />
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 bg-surface-2 rounded-md animate-pulse w-16" />
                      <div className="h-3.5 bg-surface-2 rounded-full animate-pulse w-20" />
                      <div className="h-3.5 bg-surface-2 rounded-full animate-pulse w-14" />
                    </div>
                  </div>
                </div>
                <div className="w-4 h-4 bg-surface-2 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          groupOrder.map(groupName => {
            const items = groupedFiltered[groupName];
            if (!items || items.length === 0) return null;
            
            return (
              <div key={groupName} className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-widest pl-2">
                  {groupName}
                </h3>
                <div className="flex flex-col gap-3">
                  {items.map((item: any) => {
                    const highRiskCount = item.result?.redFlags?.filter((rf: any) => rf.risk === 'High').length ?? 0;
                    const hasHighRisk = highRiskCount > 0;
                    
                    const personaIcon =
                      item.persona === 'Chill Friend' ? '☕' :
                      item.persona === 'Angry Lawyer' ? '⚖️' :
                      item.persona === 'Corporate Mentor' ? '💼' : '🛡️';

                    return (
                      <Link
                        key={item.id}
                        to={`/analyze/${item.id}`}
                         className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform,border-color] duration-150 group flex items-center justify-between gap-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            hasHighRisk ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                              {item.fileName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-text-subtle shrink-0">
                                <Calendar className="w-3 h-3" />
                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-subtle lowercase shrink-0">
                                {personaIcon} {item.persona}
                              </span>
                              {hasHighRisk ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                                  <AlertTriangle className="w-3 h-3" /> {highRiskCount} risk{highRiskCount > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                                  <CheckCircle2 className="w-3 h-3" /> clean
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-2 rounded-lg text-text-subtle hover:text-red-500 hover:bg-red-500/10 md:opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : history.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl border border-dashed border-border text-center flex flex-col items-center gap-5 bg-surface/30 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center border border-border shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300">
              <FileText className="w-10 h-10 text-text-subtle/60" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="font-display font-bold text-xl text-text">No analyses yet</p>
              <p className="text-[13px] text-text-muted max-w-[260px] leading-relaxed">
                Your analyzed contracts will magically appear here. Let's get started!
              </p>
            </div>
            <Link to="/dashboard" className="bg-text text-background py-2.5 px-6 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity mt-2">
              Analyze a Contract
            </Link>
          </div>
        ) : (
          <div className="py-20 px-6 rounded-3xl border border-dashed border-border text-center flex flex-col items-center gap-5 bg-surface/30 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center border border-border shadow-sm -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Search className="w-10 h-10 text-text-subtle/60" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="font-display font-bold text-xl text-text">No matching results</p>
              <p className="text-[13px] text-text-muted max-w-[260px] leading-relaxed">
                We couldn't find any documents matching your current search or filters.
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors mt-2 px-4 py-2 rounded-lg hover:bg-primary/5"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
