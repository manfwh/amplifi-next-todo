"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Page({ params }: { params: { group: string } }) {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut, ...rest } = useAuthenticator();
  console.log('user', user, rest)
  function listTodos() {
    const subscription = client.models.Todo.observeQuery({
      filter: {
        group: {
          eq: params.group
        }
      }
    }).subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => {
      subscription.unsubscribe();
    };
  }

  useEffect(() => {
    listTodos();
    console.log('22')
    fetchAuthSession().then((session) => {
      console.log('session', session)
    })
    
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
      group: params.group
    });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
 

  return (
    <main>
     
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li 
          onClick={() => deleteTodo(todo.id)}
            key={todo.id}
          >
            {todo.content}
          </li>
        ))}
      </ul>
     
      <button 
        onClick={signOut}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}
      >
        Sign out
      </button>
    </main>
  );
}
