"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();
  function listTodos() {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => {
      subscription.unsubscribe();
    };
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
  const joinGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.signInDetails?.loginId) return;
    console.log('client.mutations', client.mutations)
    const formData = new FormData(e.target as HTMLFormElement);
    const groupName = formData.get("groupName") as string;
    const result = await client.mutations.addUserToGroup({ userId: user.signInDetails?.loginId, groupName });
    console.log(result);
    console.log('result', result)
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <div>Join a group</div>
      <form onSubmit={joinGroup}>
        <input type="text" name="groupName" />
        <button type="submit">Join</button>
      </form>
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
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
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
