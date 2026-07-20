import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type AccordionProps = { items: { value: string; title: string; content: string }[]; className?: string };

export function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.value ?? null);
  return (
    <div className={cn('divide-y divide-black/10 rounded-xl border border-black/10 bg-white', className)}>
      {items.map((item) => {
        const isOpen = open === item.value;
        return (
          <div key={item.value}>
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center justify-between gap-6 px-5 text-left text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/30"
              onClick={() => setOpen(isOpen ? null : item.value)}
            >
              <span>{item.title}</span>
              <ChevronDown className={cn('size-4 shrink-0 text-[#6e6e73] transition-transform duration-150', isOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-[#6e6e73]">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
