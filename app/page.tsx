"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";

import "./../app/app.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { signOut} = useAuthenticator();
  
  return (
    <main>
     
      <p>Please select a group</p>
     
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
