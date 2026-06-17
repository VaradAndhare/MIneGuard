import History from "@/pages/History";
import SignIn from "@/pages/SignIn";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
// ==========================
// ⭐ ROUTER (WOUTER)
// ==========================
function Router() {
    return (<Switch>
      <Route path="/" component={() => (<ProtectedRoute component={Home}/>)}/>
      <Route path="/signin" component={SignIn}/>   {/* ⭐ SIGN IN PAGE */}
      <Route path="/signup" component={SignUp}/>   {/* ⭐ SIGN UP PAGE */}
      <Route path="/history" component={() => (<ProtectedRoute component={History}/>)}/>{/* ⭐ HISTORY PAGE */}
      <Route component={NotFound}/>
    </Switch>);
}
// ==========================
// ⭐ MAIN CONTENT
// ==========================
import Sidebar from "@/components/Sidebar"; // ⭐ ADD THIS IMPORT
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
function AppContent() {
    const { theme, setTheme } = useTheme();
    const [location] = useLocation();
    const isAuthPage = location === "/signin" ||
        location === "/signup";
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    if (isAuthPage) {
        return (<div className="min-h-screen bg-background">
        <Router />
      </div>);
    }
    return (<div className="min-h-screen bg-background">

      <Header theme={theme} onThemeToggle={toggleTheme}/>

      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <Router />
        </div>
      </div>

    </div>);
}
// ==========================
// ⭐ ROOT APP
// ==========================
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
