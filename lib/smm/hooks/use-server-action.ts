"use client";

import { useState, useTransition, type FormEvent } from "react";

type ActionResult = { ok: true; [key: string]: unknown } | { ok: false; error: string };

// Calls a Server Action directly from a client form. Avoids depending on
// React 19's useActionState (not available on this project's React 18),
// while still giving pending/error state and redirect-safe error handling.
export function useServerAction<T extends ActionResult>(action: (formData: FormData) => Promise<T>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const res = await action(formData);
        setResult(res);
        if (!res.ok) setError(res.error);
      } catch (err) {
        // Server Actions signal redirect()/notFound() via a thrown error carrying
        // a NEXT_REDIRECT/NEXT_NOT_FOUND digest — let those propagate untouched.
        const digest = (err as { digest?: string } | undefined)?.digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_")) throw err;
        setError("حدث خطأ غير متوقع، حاول مرة أخرى");
      }
    });
  }

  return { handleSubmit, pending, error, result };
}
