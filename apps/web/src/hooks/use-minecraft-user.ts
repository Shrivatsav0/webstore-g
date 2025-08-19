"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useCartStore } from "../../stores/cart";

export function useMinecraftUser() {
  const { sessionId } = useCartStore();

  const {
    data: mcUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...orpc.mcUsers.get.queryOptions({
      input: { sessionId: sessionId || "" },
    }),
    enabled: !!sessionId,
    queryKey: ["mcUser", sessionId],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: validation } = useQuery({
    ...orpc.mcUsers.validateForCheckout.queryOptions({
      input: { sessionId: sessionId || "" },
    }),
    enabled: !!sessionId,
    queryKey: ["mcUserValidation", sessionId],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    mcUser,
    validation,
    isLoading,
    error,
    refetch,
    hasUsername: !!mcUser?.minecraftUsername,
    isValid: validation?.isValid || false,
  };
}
