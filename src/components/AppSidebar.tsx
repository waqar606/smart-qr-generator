import { PlusCircle, QrCode, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const items = [
  { title: 'Create QR Code', url: '/', icon: PlusCircle },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'My QR Codes', url: '/my-qr-codes', icon: QrCode },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();

  return (
    <Sidebar className="w-60 border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <QrCode className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg">QR Generator</span>
        </div>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-accent" activeClassName="bg-accent text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-3 border-t">
          <div className="text-xs text-muted-foreground truncate">
            {user?.email ?? ""}
          </div>
          <Button
            className="mt-2 w-full"
            variant="outline"
            onClick={() => void signOut()}
          >
            Sign out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
