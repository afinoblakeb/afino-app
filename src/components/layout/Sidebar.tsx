"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LayoutDashboard,
  FolderTree,
  User,
  PanelLeftIcon,
  BarChart,
  Calendar,
  Users,
  Briefcase,
  Mail,
  Shield,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

interface UserOrganizationResponse {
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      slug: string;
      domain?: string | null;
    };
  }>;
}

type SidebarProps = {
  organizations: Organization[];
  currentOrganization: Organization;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  onOrganizationChange: (organization: Organization) => void;
};

// Custom sidebar trigger component for mobile
function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 md:hidden"
    >
      <PanelLeftIcon className="h-4 w-4" />
    </Button>
  );
}

export function AppSidebar({
  organizations,
  currentOrganization,
  user,
  onOrganizationChange,
}: SidebarProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(organizations);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Main Section': true,
    'Secondary Section': false,
  });

  // Fetch real organizations from the API
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch('/api/users/me/organizations', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json() as UserOrganizationResponse;
          if (data.organizations && data.organizations.length > 0) {
            const mappedOrgs = data.organizations.map((org) => ({
              id: org.organization.id,
              name: org.organization.name,
              slug: org.organization.slug,
              logoUrl: '', // Add logoUrl if available
            }));
            setUserOrganizations(mappedOrgs);
          }
        }
      } catch {
        // Silently fail and use the provided organizations as fallback
      }
    }
    
    fetchOrganizations();
  }, []);

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOrganizationSelect = (org: Organization) => {
    onOrganizationChange(org);
    router.push(`/organizations/${org.slug}`);
  };

  return (
    <>
      <CustomSidebarTrigger />
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                <Avatar className="h-8 w-8">
                  {currentOrganization.logoUrl ? (
                    <AvatarImage src={currentOrganization.logoUrl} alt={currentOrganization.name} />
                  ) : (
                    <AvatarFallback>
                      {currentOrganization.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium truncate max-w-[120px] group-data-[collapsible=icon]:hidden">
                  {currentOrganization.name}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Organization Switcher</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {userOrganizations.map((org) => (
                <DropdownMenuItem 
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org)}
                  className={org.id === currentOrganization.id ? "bg-muted" : ""}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    {org.logoUrl ? (
                      <AvatarImage src={org.logoUrl} alt={org.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {org.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{org.name}</span>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/organizations')}>
                <Briefcase className="h-4 w-4 mr-2" />
                All Organizations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/organizations/new')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {/* Main Dashboard Item */}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Main Section with Sub-Items */}
            <SidebarGroup>
              <SidebarGroupLabel
                onClick={() => toggleExpanded('Main Section')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <FolderTree className="h-4 w-4 mr-2" />
                  <span className="group-data-[collapsible=icon]:hidden">Main Section</span>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className={expanded['Main Section'] ? 'block' : 'hidden'}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BarChart className="h-4 w-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Calendar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users className="h-4 w-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Team</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Secondary Section with Sub-Items */}
            <SidebarGroup>
              <SidebarGroupLabel
                onClick={() => toggleExpanded('Secondary Section')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="group-data-[collapsible=icon]:hidden">Secondary Section</span>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className={expanded['Secondary Section'] ? 'block' : 'hidden'}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Messages</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Security</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <Separator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push('/profile')}>
                <User className="h-4 w-4 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">My Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-2 h-auto p-2 justify-start">
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    ) : (
                      <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {user.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
} 