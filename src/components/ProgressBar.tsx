type Props = {
  current: number;
  goal: number;
};

function ProgressBar({ current, goal }: Props) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div>
      <p className="mb-2 font-bold">Meta de donaciones</p>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-400">
        {current.toLocaleString()} / {goal.toLocaleString()}
      </p>
    </div>
  );
}

export default ProgressBar;
