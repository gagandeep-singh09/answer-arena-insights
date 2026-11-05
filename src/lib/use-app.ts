import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getStatus, listEvaluations, listBugs } from "./eval.functions";
import { DEMO_EVALUATIONS } from "./demo";
import type { EvalRow } from "./metrics";

const KEY = "ape-demo-mode";

export function useStatus() {
  return useQuery({ queryKey: ["status"], queryFn: () => getStatus(), staleTime: 60_000 });
}

/** Demo mode is forced on while keys are missing; otherwise it's a user preference. */
export function useDemoMode() {
  const status = useStatus();
  const [pref, setPref] = useState(false);
  useEffect(() => setPref(localStorage.getItem(KEY) === "1"), []);
  const set = (v: boolean) => {
    localStorage.setItem(KEY, v ? "1" : "0");
    setPref(v);
    window.dispatchEvent(new Event("ape-demo"));
  };
  useEffect(() => {
    const h = () => setPref(localStorage.getItem(KEY) === "1");
    window.addEventListener("ape-demo", h);
    return () => window.removeEventListener("ape-demo", h);
  }, []);
  const configured = status.data?.configured ?? true;
  return { demo: !configured || pref, forced: !configured, setDemo: set, configured };
}

export function useEvaluations() {
  const { demo } = useDemoMode();
  const q = useQuery({ queryKey: ["evaluations"], queryFn: () => listEvaluations(), enabled: !demo });
  return {
    demo,
    rows: (demo ? DEMO_EVALUATIONS : (q.data as EvalRow[] | undefined) ?? []) as EvalRow[],
    isLoading: !demo && q.isLoading,
    error: demo ? null : q.error,
  };
}

export function useBugs() {
  return useQuery({ queryKey: ["bugs"], queryFn: () => listBugs() });
}
