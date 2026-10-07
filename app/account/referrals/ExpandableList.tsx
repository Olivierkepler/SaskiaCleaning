"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

const DEFAULT_VISIBLE_COUNT = 3;

export default function ExpandableList({
  items,
  ariaLabel,
  className,
}: {
  items: ReactNode[];
  ariaLabel: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hasMore = items.length > DEFAULT_VISIBLE_COUNT;
  const visibleItems = expanded ? items : items.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <>
      <ul id={listId} aria-label={ariaLabel} className={className}>
        {visibleItems}
      </ul>
      {hasMore ? (
        <div className="pt-3 text-center">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            {expanded ? "Show less" : "See more"}
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : null}
    </>
  );
}
