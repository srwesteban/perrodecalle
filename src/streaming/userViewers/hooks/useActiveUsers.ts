/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";

export function useActiveUsers(key = "activeUsers") {
  const [count, setCount] = useState(0);
  const id = useMemo(() => Math.random().toString(36).slice(2), []);

  const getData = () => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  };

  const cleanAndUpdate = (data: Record<string, number>) => {
    const now = Date.now();
    Object.keys(data).forEach(uid => {
      if (now - data[uid] > 10000) delete data[uid];
    });
    setCount(Object.keys(data).length);
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    const markActive = () => {
      const data = getData();
      data[id] = Date.now();
      cleanAndUpdate(data);
    };

    const updateCount = () => cleanAndUpdate(getData());

    markActive();
    const interval = setInterval(markActive, 5000);
    window.addEventListener("storage", updateCount);

    return () => {
      const data = getData();
      delete data[id];
      cleanAndUpdate(data);
      clearInterval(interval);
      window.removeEventListener("storage", updateCount);
    };
  }, [id, key]);

  return count;
}