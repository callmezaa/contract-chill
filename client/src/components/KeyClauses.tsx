import { motion } from 'framer-motion';
import { Shield, Clock, DollarSign, Ban, Briefcase, FileText } from 'lucide-react';
import { useState } from 'react';

interface Clause {
  title: string;
  explanation: string;
}

interface KeyClausesProps {
  clauses: Clause[];
}

const getIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('termination') || t.includes('end')) return <Ban className="w-4 h-4" />;
  if (t.includes('payment') || t.includes('fee') || t.includes('money')) return <DollarSign className="w-4 h-4" />;
  if (t.includes('duration') || t.includes('term') || t.includes('time')) return <Clock className="w-4 h-4" />;
  if (t.includes('liability') || t.includes('risk') || t.includes('shield')) return <Shield className="w-4 h-4" />;
  if (t.includes('work') || t.includes('scope') || t.includes('service')) return <Briefcase className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

export const KeyClauses = ({ clauses }: KeyClausesProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!clauses || clauses.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-display font-semibold text-text">Key terms at a glance</h3>
        <span className="text-[10px] font-medium text-text-subtle uppercase tracking-[0.12em]">{clauses.length} clauses</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {clauses.map((clause, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className={`group p-4 bg-surface rounded-2xl border shadow-sm transition-[border-color,box-shadow,transform] duration-150 cursor-pointer relative overflow-hidden ${
                isExpanded 
                  ? 'border-primary/50 shadow-md ring-1 ring-primary/20' 
                  : 'border-border/50 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isExpanded ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-text-subtle group-hover:bg-primary/5 group-hover:text-primary'
                }`}>
                  {getIcon(clause.title)}
                </div>
                <h4 className={`text-[13px] font-bold leading-tight transition-colors ${
                  isExpanded ? 'text-primary' : 'text-text group-hover:text-primary'
                }`}>
                  {clause.title}
                </h4>
              </div>
              <p className={`text-[11px] text-text-muted leading-relaxed transition-all duration-300 ${
                isExpanded ? '' : 'line-clamp-2 md:group-hover:line-clamp-none'
              }`}>
                {clause.explanation}
              </p>
              
              {/* Subtle indicator */}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 transition-all ${
                isExpanded ? 'bg-primary/40' : 'bg-primary/0 group-hover:bg-primary/10'
              }`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
