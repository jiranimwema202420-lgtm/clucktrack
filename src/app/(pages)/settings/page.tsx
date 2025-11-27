'use client';

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
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { updateProfile } from 'firebase/auth';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters.").optional().or(z.literal('')),
});


export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { user, auth } = useFirebase();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName || '' },
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

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    try {
        await updateProfile(user, { displayName: values.displayName });
        toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Select between light and dark mode.
              </p>
            </div>
            <div className="flex gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}>
                    <Moon className="h-[1.2rem] w-[12.rem]" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      { user ? (
        <Card>
            <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account details.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit">Save Changes</Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      ) : (
        <Card>
            <CardHeader>
            <CardTitle>{isRegistering ? 'Create an Account' : 'Sign In'}</CardTitle>
            <CardDescription>{isRegistering ? 'Enter your details to create a new account.' : 'Sign in to access your dashboard.'}</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                    control={loginForm.control}
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
                    control={loginForm.control}
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
                <div className='flex flex-col gap-4'>
                    <Button type="submit" className="w-full">{isRegistering ? 'Register' : 'Sign In'}</Button>
                    <Button variant="link" type="button" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
