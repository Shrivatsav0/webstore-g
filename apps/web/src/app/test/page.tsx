"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc"; // adjust path
import type { User } from "better-auth";

export default function UsersPage() {
  const users = useQuery({
    ...orpc.adminUsers.queryOptions(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  if (users.isLoading) return <div>Loading...</div>;
  if (users.error) return <div>Error: {(users.error as Error).message}</div>;

  return (
    <ul>
      {users.data?.map((user: User) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
