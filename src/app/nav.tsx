
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Boxes, 
  BarChart3, 
  BrainCircuit, 
  HeartPulse,
  DollarSign,
  ShoppingCart,
  FileOutput,
  MessageSquare,
  Settings,
  LifeBuoy
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const navGroups = [
    {
        title: 'Main',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Farm',
        items: [
            { href: '/inventory', label: 'Inventory', icon: Boxes },
            { href: '/sales', label: 'Sales', icon: DollarSign },
            { href: '/expenditure', label: 'Expenditure', icon: ShoppingCart },
        ]
    },
    {
        title: 'Analytics',
        items: [
            { href: '/financials', label: 'Financials', icon: FileOutput },
            { href: '/reports', label: 'Reports', icon: BarChart3 },
        ]
    },
    {
        title: 'AI Tools',
        items: [
            { href: '/feed-optimization', label: 'Feed AI', icon: BrainCircuit },
            { href: '/health-prediction', label: 'Health AI', icon: HeartPulse },
            { href: '/poultry-qa', label: 'Poultry Q&A', icon: MessageSquare },
        ]
    },
    {
        title: 'General',
        items: [
            { href: '/settings', label: 'Settings', icon: Settings },
            { href: '/help', label: 'Help', icon: LifeBuoy },
        ]
    }
]

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="block">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <Accordion type="multiple" defaultValue={navGroups.map(g => g.title)} className="w-full">
        {navGroups.map((group) => (
            <SidebarGroup key={group.title}>
                <AccordionItem value={group.title} className="border-none">
                    <AccordionTrigger className="text-xs text-muted-foreground uppercase tracking-wider font-semibold hover:no-underline py-2 px-2 rounded-md hover:bg-muted">
                        {group.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.label}
                                >
                                    <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </SidebarGroup>
        ))}
        </Accordion>
      </SidebarContent>
    </>
  );
}
