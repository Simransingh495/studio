'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import * as geofire from 'geofire-common';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bloodTypes } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  bloodType: z.string().min(1, { message: 'Please select a blood type' }),
  location: z.string().min(2, { message: 'Location is required' }),
});

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: currentUser, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bloodType: '',
      location: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        bloodType: currentUser.bloodType,
        location: currentUser.location,
      });
    }
  }, [currentUser, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userDocRef) return;
    setIsLoading(true);
    try {
      const userData: any = { ...values };

      // Re-calculate geohash if location changes, though this form doesn't auto-detect coordinates
      // In a real app, you might use a geocoding service here.
      
      await updateDoc(userDocRef, userData);

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully updated.',
      });
      router.push('/app/profile');
    } catch (error: any) {
      console.error('Update Error:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isUserLoading || isUserDataLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Edit Profile</h2>
        <Card className="w-full">
        <CardHeader>
            <CardTitle>Update Your Information</CardTitle>
            <CardDescription>
            Keep your profile details current.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>City, State</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Bengaluru, KA" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Blood Type</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your blood type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                            {type}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
        </Card>
    </div>
  );
}
