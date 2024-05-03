import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

interface TooltipBaseProps {
  children: React.ReactNode;
  content: string;
}

const TooltipBase: React.FC<TooltipBaseProps> = ({ children, content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default TooltipBase;
