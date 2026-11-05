import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { OPENAI_MODEL, GEMINI_MODEL } = await import("./ai.server");
  return {
    configured: Boolean(process.env["LOVABLE_API_KEY"]),
    openaiModel: OPENAI_MODEL,
    geminiModel: GEMINI_MODEL,
  };
});

export const runEvaluation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ question: z.string().trim().min(3).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI keys are not configured on the server.");
    const { callOpenAI, callGemini, OPENAI_MODEL, GEMINI_MODEL } = await import("./ai.server");
    const [o, g] = await Promise.all([callOpenAI(data.question, key), callGemini(data.question, key)]);
    const db = await admin();
    const { data: row, error } = await db
      .from("evaluations")
      .insert({
        question: data.question,
        openai_model: OPENAI_MODEL,
        gemini_model: GEMINI_MODEL,
        openai_response: o.text,
        gemini_response: g.text,
        openai_error: o.error,
        gemini_error: g.error,
        openai_latency_ms: o.latencyMs,
        gemini_latency_ms: g.latencyMs,
      })
      .select()
      .single();
    if (error) throw new Error("Could not save evaluation: " + error.message);
    return row;
  });

export const saveVerdict = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        openai_rating: z.number().int().min(1).max(5).nullable(),
        gemini_rating: z.number().int().min(1).max(5).nullable(),
        preferred_model: z.enum(["openai", "gemini", "tie"]).nullable(),
        notes: z.string().max(2000).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const db = await admin();
    const { data: row, error } = await db
      .from("evaluations")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listEvaluations = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("evaluations").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return data;
});

export const deleteEvaluation = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("evaluations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listBugs = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("bug_reports").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

export const createBug = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        title: z.string().trim().min(3).max(200),
        description: z.string().max(4000),
        model: z.enum(["openai", "gemini", "both"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        evaluation_id: z.string().uuid().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db.from("bug_reports").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateBugStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["open", "investigating", "resolved"]) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("bug_reports").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
