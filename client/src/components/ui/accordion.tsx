import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

type AccordionProps = { items: { value: string; title: string; content: string }[]; className?: string };

export function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.value ?? null);
  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => {
        const isOpen = open === item.value;
        return (
          <div key={item.value}>
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center justify-between gap-6 py-2 text-left text-[15px] font-medium text-text transition-colors hover:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring rounded-sm"
              onClick={() => setOpen(isOpen ? null : item.value)}
            >
              <span>{item.title}</span>
              <Plus
                className={cn('size-4 shrink-0 text-text-subtle transition-transform duration-200', isOpen && 'rotate-45 text-text')}
                aria-hidden="true"
              />
            </button>
            {isOpen && <div className="pb-6 pr-8 text-sm leading-relaxed text-text-muted">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
