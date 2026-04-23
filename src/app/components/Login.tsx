import { useState } from 'react';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

function friendlyAuthMessage(raw: string): string {
  if (/failed to fetch|network error|load failed|networkerror/i.test(raw)) {
    return (
      "Could not reach Supabase. If you have a .env.local file, remove empty VITE_SUPABASE_URL or " +
      "VITE_SUPABASE_ANON_KEY lines (or paste real values from Supabase → Project Settings → API), " +
      "then restart npm run dev. Also check VPN, firewall, and ad blockers."
    );
  }
  return raw;
}

export function Login() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error, session } = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.name.trim() || formData.email.split('@')[0] || 'Student',
        );
        if (error) {
          setAuthError(friendlyAuthMessage(error.message));
          return;
        }
        if (session) {
          toast.success('Welcome to IntelliNote');
        } else {
          toast.message('Confirm your email', {
            description:
              'We sent a link to your inbox. After confirming, sign in here.',
          });
        }
      } else {
        const { error } = await signInWithEmail(formData.email, formData.password);
        if (error) {
          setAuthError(friendlyAuthMessage(error.message));
          return;
        }
        toast.success('Signed in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(friendlyAuthMessage(error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex justify-center"
          >
            <Logo size="lg" variant="purple" showText={false} />
          </motion.div>
          <h1 className="mb-2">IntelliNote</h1>
          <p className="text-muted-foreground">AI-Powered Study Companion</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl backdrop-blur-sm bg-card/95">
          <div className="mb-6">
            <h2 className="mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? 'Sign up to start your learning journey'
                : 'Sign in to continue your studies'}
            </p>
          </div>

          {authError && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {authError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - only for signup */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password - only for login */}
            {!isSignUp && (
              <div className="flex justify-end">
                <Button variant="link" className="text-sm px-0">
                  Forgot password?
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>{' '}
            <Button
              variant="link"
              className="px-1"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <Button variant="link" className="px-1 text-sm h-auto">
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button variant="link" className="px-1 text-sm h-auto">
            Privacy Policy
          </Button>
        </p>
      </motion.div>
    </div>
  );
}