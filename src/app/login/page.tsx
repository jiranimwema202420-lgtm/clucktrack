
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Logo } from '@/components/logo';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginPage() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) return;
    try {
        if(isRegistering) {
            await initiateEmailSignUp(auth, values.email, values.password);
            toast({ title: 'Registration Successful', description: 'You have been signed up.' });
        } else {
            await initiateEmailSignIn(auth, values.email, values.password);
            toast({ title: 'Login Successful', description: 'You are now signed in.' });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Authentication Failed', description: error.message });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <Logo />
            <CardTitle className="text-2xl">{isRegistering ? 'Create an Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>{isRegistering ? 'Enter your details to create a new account.' : 'Sign in to access your CluckHub dashboard.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className='flex flex-col gap-4 pt-4'>
                    <Button type="submit" className="w-full">{isRegistering ? 'Register' : 'Sign In'}</Button>
                    <Button variant="link" type="button" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                    </Button>
                </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
