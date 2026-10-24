import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number | string | null;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  className?: string;
  to?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-slate-400',
  className,
  to,
}) => {
  const content = (
    <Card className={cn('relative transition-all duration-150', to && 'hover:border-slate-300 hover:shadow-xs cursor-pointer', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
        <Icon className={cn('w-4 h-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value !== null ? value : '...'}
        </div>
        <div className="flex items-center justify-between mt-1">
          <CardDescription className="text-xs text-slate-500">
            {description}
          </CardDescription>
          {to && (
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }

  return content;
};

export default SummaryCard;
