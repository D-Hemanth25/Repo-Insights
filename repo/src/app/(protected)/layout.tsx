import { SidebarProvider } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import AppSidebar from "./app-sidebar"
import { Search } from "lucide-react"

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children } : Props) => {
  return (
      <SidebarProvider>
        {/* <div className="flex h-screen"> */}
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 bg-white border rounded-md px-4 py-2 w-full max-w-md">
                <Search className="text-gray-500" />
                <input type="text" placeholder="Search..." className="flex-1 outline-none" />
              </div>
              <div className="ml-auto">
                <UserButton />
              </div>
            </div>
            <div className="bg-white border rounded-md p-6 h-[calc(100vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </main>
        {/* </div> */}
      </SidebarProvider>
  )
}

export default SidebarLayout