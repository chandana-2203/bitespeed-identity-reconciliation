import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type IdentifyRequest } from "@shared/schema";

export function useIdentify() {
  return useMutation({
    mutationFn: async (data: IdentifyRequest) => {
      // Clean up empty strings to match optional backend behavior better
      const payload = {
        ...(data.email ? { email: data.email } : {}),
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
      };

      const res = await fetch(api.identify.path, {
        method: api.identify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to identify contact");
      }

      const json = await res.json();
      return api.identify.responses[200].parse(json);
    },
  });
}
