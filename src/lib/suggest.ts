import { api } from "@/lib/api";

export interface SuggestInput {
  N: number; P: number; K: number;
  temperature?: number; humidity?: number; ph?: number; rainfall?: number;
  prediction?: string;
}

export async function getSuggestions(input: SuggestInput) {
  try {
    const res = await api.post("/suggest", input);
    return res.data as any;
  } catch (err: any) {
    const serverMsg = err?.response?.data?.error;
    const msg = serverMsg || err?.message || "Suggest failed";
    throw new Error(msg);
  }
}


