'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface MutationResult 
{
  success: boolean;
  error?: string;
}

interface UseCrudFormActionsOptions 
{
  redirectTo: string;
}

export function useCrudFormActions(opts: UseCrudFormActionsOptions) 
{
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const run = useCallback(async (fn: () => Promise<MutationResult>) => 
  {
    setIsSubmitting(true);
    try 
    {
      const result = await fn();
      if (result.success) 
      {
        router.push(opts.redirectTo);
        router.refresh();
      } 
      else 
      {
        alert(`Error: ${result.error}`);
      }
    } 
    catch (e) 
    {
      console.error(e);
      alert('An error occurred while submitting the form');
    } 
    finally 
    {
      setIsSubmitting(false);
    }
  }, [router, opts.redirectTo]);

  const runWithConfirm = useCallback(async (
    confirmMessage: string,
    fn: () => Promise<MutationResult>
  ) => 
  {
    if (!confirm(confirmMessage)) 
    {
      return;
    }
    await run(fn);
  }, [run]);

  return { isSubmitting, run, runWithConfirm };
}
