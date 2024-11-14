'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Trash2Icon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useSWR from 'swr';

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Page({ params }: { params: { group: string } }) {
  const {
    data: todos,
    mutate,
    isLoading,
  } = useSWR<Array<Schema['Todo']['type']>>(
    () => `${params.group}-todos`,
    async () => {
      const res = await client.models.Todo.list({
        filter: {
          group: {
            eq: decodeURIComponent(params.group),
          },
        },
      });
      return res.data;
    }
  );
  // useEffect(() => {
  //   const subscription = client.models.Todo.observeQuery({
  //     filter: {
  //       group: {
  //         eq: decodeURIComponent(params.group),
  //       }
  //     }
  //   }).subscribe({
  //     next: (data) => {
  //       console.log('subscription data', data);
  //     },
  //     error: (error) => {
  //       console.error('subscription error', error);
  //     },
  //   });
  //   return () => {
  //     console.log('unsubscribing');
  //     subscription.unsubscribe();
  //   };
  // })

  // submit loading state
  const [loading, setLoading] = useState(false);
  async function createTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;
    if (content) {
      setLoading(true);
      const res = await client.models.Todo.create({
        content,
        group: decodeURIComponent(params.group),
      });
      setLoading(false);
      if (res.errors) {
        toast({
          title: 'Error',
          description: 'There was an error adding your todo',
          variant: 'destructive',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Todo added',
          description: 'Your todo has been added to the list',
          variant: 'default',
          duration: 3000,
        });
        mutate();
        const form = e.target as HTMLFormElement;
        form.reset();
      }
    }
  }

  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id });
    mutate();
  }

  return (
    <div className='grid gap-4 md:w-[500px] mx-auto'>
      <div className='pt-20'>
        <h1 className='text-2xl font-bold text-center mb-4'>
          {decodeURIComponent(params.group)} Todo List
        </h1>
        <form className='flex gap-2 w-full' onSubmit={createTodo}>
          <Input type='text' name='content' placeholder='Add a new todo...' />
          <Button type='submit' disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </div>

      <ul className='w-full space-y-2'>
        {isLoading && (
          <div className='flex justify-center items-center h-20'>
            <Loader2Icon className='w-4 h-4 animate-spin' />
          </div>
        )}
        {todos?.map((todo) => (
          <li
            key={todo.id}
            className='flex items-center justify-between px-3 py-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer'
          >
            <span>{todo.content}</span>
            <Button variant='ghost' onClick={() => deleteTodo(todo.id)} size={'icon'}>
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
