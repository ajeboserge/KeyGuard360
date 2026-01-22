import { signIn, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        onLogin(attributes.email || "Admin User");
      } catch (err) {
        // No user signed in, ignore
      }
    };
    checkUser();
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
        username,
        password
      });

      if (isSignedIn) {
        const attributes = await fetchUserAttributes();
        onLogin(attributes.email || username);
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setError("Please confirm your email before signing in.");
      } else {
        setError(`Unexpected authentication step: ${nextStep.signInStep}`);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.name === 'UserNotFoundException') {
        setError("User does not exist.");
      } else if (err.name === 'NotAuthorizedException') {
        setError("Incorrect username or password.");
      } else if (err.name === 'UserNotConfirmedException') {
        setError("User email not confirmed.");
      } else if (err.name === 'UserAlreadyAuthenticatedException') {
        try {
          const attributes = await fetchUserAttributes();
          onLogin(attributes.email || "Admin User");
        } catch {
          setError("Already logged in, but failed to retrieve user. Please refresh.");
        }
      } else if (err.message?.includes("XXXXXXX")) {
        setError("Cognito is not configured. Please enter your User Pool ID in aws-config.ts");
      } else {
        setError(err.message || "An error occurred during sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">KeyGuard360</CardTitle>
          <CardDescription>
            Enterprise Security & Compliance Platform
          </CardDescription>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              <Lock className="h-3 w-3" />
              AWS Cognito Authentication (Active)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin@keyguard360.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Production Login:</p>
              <p className="text-xs text-muted-foreground">
                Enter your assigned Cognito credentials. MFA will be prompted if enabled.
              </p>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <p>🔒 Authenticating via AWS Cognito (eu-north-1)</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
