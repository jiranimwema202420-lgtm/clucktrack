
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
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters.").optional().or(z.literal('')),
});

const farmDetailsSchema = z.object({
    farmName: z.string().min(2, "Farm name must be at least 2 characters.").optional().or(z.literal('')),
    farmLocation: z.string().min(2, "Farm location must be at least 2 characters.").optional().or(z.literal('')),
    farmContact: z.string().min(10, "Contact must be at least 10 characters.").optional().or(z.literal('')),
});


export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { user, firestore } = useFirebase();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { displayName: user?.displayName || '' },
  });

  const farmDetailsForm = useForm<z.infer<typeof farmDetailsSchema>>({
    resolver: zodResolver(farmDetailsSchema),
    values: {
        farmName: userProfile?.farmName || '',
        farmLocation: userProfile?.farmLocation || '',
        farmContact: userProfile?.farmContact || '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ displayName: user.displayName || '' });
    }
    if (userProfile) {
        farmDetailsForm.reset({
            farmName: userProfile.farmName || '',
            farmLocation: userProfile.farmLocation || '',
            farmContact: userProfile.farmContact || '',
        });
    }
  }, [user, userProfile, profileForm, farmDetailsForm]);


  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    try {
        await updateProfile(user, { displayName: values.displayName });
        if (userProfileRef) {
            setDocumentNonBlocking(userProfileRef, { displayName: values.displayName }, { merge: true });
        }
        toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  }

  async function onFarmDetailsSubmit(values: z.infer<typeof farmDetailsSchema>) {
    if (!userProfileRef) return;
    
    setDocumentNonBlocking(userProfileRef, values, { merge: true });
    toast({ title: 'Farm Details Updated', description: 'Your farm information has been saved.' });
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
      
      <Card>
        <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your personal account details.</CardDescription>
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

    <Card>
        <CardHeader>
        <CardTitle>Farm Details</CardTitle>
        <CardDescription>Manage your farm's information.</CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...farmDetailsForm}>
            <form onSubmit={farmDetailsForm.handleSubmit(onFarmDetailsSubmit)} className="space-y-4">
            <FormField
                control={farmDetailsForm.control}
                name="farmName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Farm Name</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., CluckHub Farms" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={farmDetailsForm.control}
                name="farmLocation"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Farm Location</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
                <FormField
                control={farmDetailsForm.control}
                name="farmContact"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                    <Input type="tel" placeholder="e.g., +254 712 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit">Save Farm Details</Button>
            </form>
        </Form>
        </CardContent>
    </Card>
    </div>
  );
}
