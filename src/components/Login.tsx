import React, { useContext, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import login from "../services/authService";
import { User } from "../models/User";
import { AuthContext } from "@/context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const user: User = { email, password };

    try {
      const token = await login.login(user);
      authContext?.login(user.email);
      localStorage.setItem("token", token);
      setMessage(`Login successful! Token: ${token}`);
      navigate("/groups");
    } catch (error: any) {
      console.error("Error during login:", error);
      setMessage(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <Card className="mx-auto max-w-sm min-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Kindergarten "Šilelis"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full cursor-pointer">
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
