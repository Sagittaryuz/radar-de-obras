
'use client';

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface ObraDeadlineBadgeProps {
  createdAt: string | Timestamp;
}

const DEADLINE_HOURS = 72;

export function ObraDeadlineBadge({ createdAt }: ObraDeadlineBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState('green');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const creationDate = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
      const deadline = new Date(creationDate.getTime() + DEADLINE_HOURS * 60 * 60 * 1000);
      const now = new Date();

      const totalSecondsLeft = Math.max(0, (deadline.getTime() - now.getTime()) / 1000);
      
      const hours = Math.floor(totalSecondsLeft / 3600);
      const minutes = Math.floor((totalSecondsLeft % 3600) / 60);

      if (hours <= 0 && minutes <= 0) {
        setTimeLeft('Prazo Esgotado');
        setUrgency('red');
      } else {
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} restantes`);
      }

      const hoursLeft = totalSecondsLeft / 3600;
      if (hoursLeft <= 24) {
        setUrgency('red'); // Less than 24 hours left
      } else if (hoursLeft <= 48) {
        setUrgency('yellow'); // Less than 48 hours left
      } else {
        setUrgency('green'); // More than 48 hours left
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <Badge
      className={cn('mb-2 shadow-md', {
        'bg-green-100 text-green-800 border-green-300 hover:bg-green-200': urgency === 'green',
        'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200': urgency === 'yellow',
        'bg-red-100 text-red-800 border-red-300 hover:bg-red-200': urgency === 'red',
      })}
    >
      <Clock className="h-3 w-3 mr-1.5" />
      {timeLeft}
    </Badge>
  );
}
