import {
  CameraIcon,
  ChartBarIcon,
  CircleHelpIcon,
  CommandIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";
import type * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  documents: [
    {
      icon: <DatabaseIcon />,
      name: "Data Library",
      url: "#",
    },
    {
      icon: <FileChartColumnIcon />,
      name: "Reports",
      url: "#",
    },
    {
      icon: <FileIcon />,
      name: "Word Assistant",
      url: "#",
    },
  ],
  navClouds: [
    {
      icon: <CameraIcon />,
      isActive: true,
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
      title: "Capture",
      url: "#",
    },
    {
      icon: <FileTextIcon />,
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
      title: "Proposal",
      url: "#",
    },
    {
      icon: <FileTextIcon />,
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
      title: "Prompts",
      url: "#",
    },
  ],
  navMain: [
    {
      icon: <LayoutDashboardIcon />,
      title: "Dashboard",
      url: "#",
    },
    {
      icon: <ListIcon />,
      title: "Lifecycle",
      url: "#",
    },
    {
      icon: <ChartBarIcon />,
      title: "Analytics",
      url: "#",
    },
    {
      icon: <FolderIcon />,
      title: "Projects",
      url: "#",
    },
    {
      icon: <UsersIcon />,
      title: "Team",
      url: "#",
    },
  ],
  navSecondary: [
    {
      icon: <Settings2Icon />,
      title: "Settings",
      url: "#",
    },
    {
      icon: <CircleHelpIcon />,
      title: "Get Help",
      url: "#",
    },
    {
      icon: <SearchIcon />,
      title: "Search",
      url: "#",
    },
  ],
  user: {
    avatar: "/avatars/shadcn.jpg",
    email: "m@example.com",
    name: "shadcn",
  },
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="font-semibold text-base">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
