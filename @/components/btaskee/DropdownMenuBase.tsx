import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@remix-run/react';
import React from 'react';

interface DropdownMenuBaseProps {
  links: { link: string; label: string }[];
}

const DropdownMenuBase: React.FC<DropdownMenuBaseProps> = ({ links }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
        <DotsHorizontalIcon className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[120px]">
      {links.map(({ link, label }) => (
        <Link to={link} key={link}>
          <DropdownMenuItem>{label}</DropdownMenuItem>
        </Link>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default DropdownMenuBase;
