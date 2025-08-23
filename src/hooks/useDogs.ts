import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type DogStats = {
  id: string;
  name: string;
  image_url: string;
  link_ref: string;
  price_cop: number;
  is_active: boolean;
  created_at: string | null;
  feeds: number;        // veces alimentado (aprobados)
  raised_cop: number;   // total recaudado en COP
  last_fed_at: string | null;
};

export function useDogs() {
  const [dogs, setDogs] = useState<DogStats[]>([]);

  async function fetchDogs() {
    const { data } = await supabase
      .from("dog_stats")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    setDogs(data ?? []);
  }

  useEffect(() => {
    fetchDogs();

    // Recalcula cuando cambian perros o donaciones
    const ch = supabase
      .channel("dogs-and-donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, fetchDogs)
      .on("postgres_changes", { event: "*", schema: "public", table: "dogs" }, fetchDogs)
      .subscribe();

    // Fallback: por si el realtime no entra, refetch cada 5s
    const poll = setInterval(fetchDogs, 5000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, []);

  return dogs;
}
