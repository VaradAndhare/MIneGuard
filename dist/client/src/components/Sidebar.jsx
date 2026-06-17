import { FileSearch, History } from "lucide-react";
import { useLocation } from "wouter";
export default function Sidebar() {
    const [location, setLocation] = useLocation();
    const linkClass = (path) => `flex items-center gap-2 p-3 rounded-lg cursor-pointer 
    ${location === path ? "bg-primary text-white" : "hover:bg-muted"}`;
    return (<aside className="w-64 border-r min-h-screen p-4 space-y-3">

      <h2 className="text-lg font-semibold mb-6">
        Dashboard
      </h2>

      <div className={linkClass("/")} onClick={() => setLocation("/")}>
        <FileSearch className="h-5 w-5"/>
        Checker
      </div>

      <div className={linkClass("/history")} onClick={() => setLocation("/history")}>
        <History className="h-5 w-5"/>
        History
      </div>

    </aside>);
}
