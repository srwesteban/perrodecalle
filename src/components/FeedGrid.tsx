import { useDogs } from "../hooks/useDogs";
import FeedDogCard from "./FeedDogCard";

export default function FeedGrid() {
  const dogs = useDogs();
  if (!dogs.length) {
    return <p className="text-sm text-gray-300">Sin perritos activos aún</p>;
  }
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {dogs.map(d => <FeedDogCard key={d.id} dog={d} />)}
    </div>
  );
}
