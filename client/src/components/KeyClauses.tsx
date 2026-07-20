import { Shield, Clock, DollarSign, Ban, Briefcase, FileText } from 'lucide-react';
import { BouncyAccordion } from '@/components/motion/bouncy-accordion';
import type { BouncyAccordionItem } from '@/components/motion/bouncy-accordion';

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
  if (!clauses || clauses.length === 0) return null;

  const items: BouncyAccordionItem[] = clauses.map((clause, i) => ({
    id: `clause-${i}`,
    title: clause.title,
    description: clause.explanation,
    icon: getIcon(clause.title),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-display font-semibold text-text">Key terms at a glance</h3>
        <span className="text-[10px] font-medium text-text-subtle uppercase tracking-[0.12em]">{clauses.length} clauses</span>
      </div>

      <BouncyAccordion items={items} collapsible />
    </div>
  );
};
