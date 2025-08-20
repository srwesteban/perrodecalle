type Props = {
  views: number;
};

function Stats({ views }: Props) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl font-bold">👀 {views.toLocaleString()}</p>
      <p className="text-sm text-gray-300">Visitas a la página</p>
    </div>
  );
}

export default Stats;
