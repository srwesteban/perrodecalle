import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../lib/supabase";

export function getOrCreateViewerId(): string {
  return localStorage.getItem("viewer_id") ?? (() => {
    const id = uuidv4();
    localStorage.setItem("viewer_id", id);
    return id;
  })();
}

export function registerViewer(viewerId: string) {
  return supabase.from("viewers").upsert({
    viewer_id: viewerId,
    user_agent: navigator.userAgent,
    last_seen: new Date().toISOString(),
  }, { onConflict: "viewer_id" });
}

export function countViewers() {
  return supabase.from("viewers").select("viewer_id", { count: "exact", head: true });
}