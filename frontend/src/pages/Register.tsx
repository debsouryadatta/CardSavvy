import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<{ token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white border-4 border-black p-6 space-y-4">
        <h1 className="text-3xl font-bold uppercase">Register</h1>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          type="password"
        />
        {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create account"}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Already have account</Button>
      </div>
    </div>
  );
}
