import { FileSearch, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeaderProps {
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export default function Header({ theme = "light", onThemeToggle }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileSearch className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">PlagiarismCheck Pro</h1>
            <p className="text-xs text-muted-foreground">Data Mining Powered</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" data-testid="link-how-it-works">
            How It Works
          </Button>
          <Button variant="ghost" size="sm" data-testid="link-pricing">
            Pricing
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onThemeToggle}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button data-testid="button-sign-in">Sign In</Button>
        </nav>
      </div>
    </header>
  );
}