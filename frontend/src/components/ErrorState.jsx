const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}) => {
  return (
    <div className="flex min-h-[300px] items-center justify-center">

      <div className="max-w-md text-center">

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          !
        </div>

        <h3 className="text-sm font-semibold text-white">
          Something went wrong
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
          >
            Try Again
          </button>
        )}

      </div>

    </div>
  );
};

export default ErrorState;