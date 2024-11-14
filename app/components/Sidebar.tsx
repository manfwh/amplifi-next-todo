'use client';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Loader2,
  Plus,
  Search,
  Settings,
  User2,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function AppSidebar() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, ...rest } = useAuthenticator();
  const {
    data: groups,
    mutate,
    isLoading,
  } = useSWR(
    () => (user.signInDetails?.loginId ? `/${user.signInDetails?.loginId}-groups` : null),
    async () => {
      const session = await fetchAuthSession({ forceRefresh: true });
      const groups = session.tokens?.idToken?.payload['cognito:groups'] as string[];
      return groups;
    }
  );

  // join group loading state
  const [joinGroupLoading, setJoinGroupLoading] = useState(false);
  const joinGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.signInDetails?.loginId) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const groupName = formData.get('groupName') as string;
    setJoinGroupLoading(true);
    const result = await client.mutations.addUserToGroup({
      userId: user.signInDetails?.loginId,
      groupName,
    });
    setJoinGroupLoading(false);
    if (result.errors) {
      toast({
        title: 'Error',
        description: 'Failed to join group',
        variant: 'destructive',
      });
    } else {
      setJoinGroupDialogOpen(false);
      // router change
      router.push(`/${groupName}`);
      mutate();
    }
  };

  const [joinGroupDialogOpen, setJoinGroupDialogOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>My groups</SidebarGroupLabel>
            <SidebarGroupAction title='Join a group' onClick={() => setJoinGroupDialogOpen(true)}>
              <Plus /> <span className='sr-only'>Join a group</span>
            </SidebarGroupAction>
            <SidebarGroupContent>

              {!isLoading && groups?.length === 0 && (
                <Button className='w-full my-4' onClick={() => setJoinGroupDialogOpen(true)}>
                  Join a group
                </Button>
              )}

              {isLoading ? (
                <SidebarMenu>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <SidebarMenu>
                  {groups?.map((item) => (
                    <SidebarMenuItem key={item}>
                      <SidebarMenuButton
                        asChild
                        isActive={decodeURIComponent(pathname) === `/${item}`}
                      >
                        <Link href={`/${item}`}>
                          {item}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {user?.signInDetails?.loginId}
                    <ChevronUp className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='top' className='w-[--radix-popper-anchor-width]'>
                  <DropdownMenuItem onClick={signOut}>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <Dialog open={joinGroupDialogOpen} onOpenChange={setJoinGroupDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Join a group</DialogTitle>
          </DialogHeader>

          <form id='joinGroupForm' onSubmit={joinGroup}>
            <div className='grid grid-cols-11 items-center gap-4 mt-4'>
              <Label htmlFor='groupName' className='text-right col-span-3'>
                Group name
              </Label>
              <Input id='groupName' name='groupName' className='col-span-8' />
            </div>
          </form>
          <DialogFooter>
            <Button
              type='submit'
              form='joinGroupForm'
              disabled={joinGroupLoading}
              className='w-full'
            >
              {joinGroupLoading ? <Loader2 className='animate-spin' /> : 'Join'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
