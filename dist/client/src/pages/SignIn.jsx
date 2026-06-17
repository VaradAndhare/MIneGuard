import { useState } from "react";
import { useLocation } from "wouter"; // ⭐ ADD THIS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // ⭐ WOUTER NAVIGATION
    const [, setLocation] = useLocation();
    const handleLogin = async () => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || "Login failed");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("✅ Login Success");
            setLocation("/");
        }
        catch (error) {
            console.error(error);
            alert("Login failed");
        }
    };
    return (<div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign In</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>

          <Button variant="outline" className="w-full" onClick={() => setLocation("/signup")}>
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>);
}
