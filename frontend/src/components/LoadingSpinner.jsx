const LoadingSpinner = ({
  text = "Loading...",
}) => {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">

        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

        <p className="text-sm text-slate-500">
          {text}
        </p>

      </div>
    </div>
  );
};

export default LoadingSpinner;