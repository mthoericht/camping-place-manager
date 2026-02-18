import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Tent, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { signup, clearError } from '@/store/authSlice';

export default function SignupPage()
{
  const dispatch = useAppDispatch();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  if (token && status === 'succeeded') return <Navigate to="/bookings" replace />;

  const handleSubmit = (e: React.FormEvent) =>
  {
    e.preventDefault();
    dispatch(signup({ email, fullName, password }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Tent className="h-10 w-10 text-foreground" />
          </div>
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>Registrieren Sie sich als Mitarbeiter</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Max Mustermann"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); dispatch(clearError()); }}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => { setEmail(e.target.value); dispatch(clearError()); }}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); dispatch(clearError()); }}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrieren'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Bereits ein Konto?{' '}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Anmelden
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
