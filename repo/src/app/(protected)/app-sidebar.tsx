'use client'
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, useSidebar} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Bot, Plus } from "lucide-react";
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { usePathname } from "next/navigation";
import Image from "next/image";
import useProject from "@/hooks/use-project";


const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    }
]

const AppSidebar = () => {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { projects, projectId, setProjectId } = useProject()
    return(
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src="/logo.jpg" alt="logo" width={40} height={40} />
                    {open && (
                        <h1 className="text-xl font-bold text-primary/80">Repo Insights</h1>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            {
                                items.map(item => {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url} className={cn({
                                                    '!bg-primary !text-white' : pathname === item.url
                                                })}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            {
                                projects?.map(project => {
                                    return (
                                        <SidebarMenuItem key={project.name}>
                                            <SidebarMenuButton asChild>
                                                <div onClick={() => {
                                                    setProjectId(project.id)
                                                }}>
                                                    <div className={cn(
                                                        'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary' ,
                                                        {
                                                            'bg-primary text-white' : project.id === projectId
                                                        }
                                                    )}>
                                                        {project.name[0]}
                                                    </div>
                                                    <span>{project.name}</span>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            }
                            <div className="h-2"></div>
                            <SidebarMenuItem>
                                <Link href="/create">
                                    <Button size="sm" variant={"outline"} className="w-fit">
                                        <Plus />
                                        Create Project
                                    </Button>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;