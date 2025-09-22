import { useState } from 'react';

interface ReadMoreProps {
  text: string;
  maxChars?: number;
  className?: string;
  moreLabel?: string;
  lessLabel?: string;
}

export function ReadMore({
  text,
  maxChars = 160,
  className = 'text-gray-700',
  moreLabel = 'ver mais',
  lessLabel = 'ver menos',
}: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text && text.length > maxChars;
  const displayText = !shouldTruncate || expanded ? text : text.slice(0, maxChars) + '...';

  return (
    <div className={`leading-relaxed ${className}`}>
      <span className="break-words whitespace-pre-line">{displayText}</span>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          aria-expanded={expanded}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}

export default ReadMore;


