"use client";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Sidebar() {
  const { user, signOut } = useAuthenticator();
  const [groups, setGroups] = useState<any[]>([]);
  const listGroups = async () => {
    fetchAuthSession({forceRefresh: true}).then((session) => {
      const groups = session.tokens?.idToken?.payload['cognito:groups'] as string[]
      console.log('groups', groups)
      if (groups) {
        setGroups(groups);
      }
    })
  }
  const joinGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.signInDetails?.loginId) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const groupName = formData.get("groupName") as string;
    const result = await client.mutations.addUserToGroup({ userId: user.signInDetails?.loginId, groupName });
    console.log(result);
    console.log('result', result)
    listGroups();
  }

  useEffect(() => {
    listGroups();
  }, []);

  return <div>
    <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <div>Join a group</div>
      <form onSubmit={joinGroup}>
        <input type="text" name="groupName" />
        <button type="submit">Join</button>
      </form>
      {/* <button onClick={createTodo}>+ new</button> */}
      {/* my groups */}
      <div>My groups</div>
      {groups.map((group) => (
        <div key={group}>
          <Link href={`/${group}`}>{group}</Link>
        </div>
      ))}
  </div>
}
