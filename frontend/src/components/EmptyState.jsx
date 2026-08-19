const EmptyState = ({
  icon = "📁",
  title = "Nothing here yet",
  description = "There is nothing to show right now.",
  action,
}) => {
  return (
    <div className="flex min-h-[300px] items-center justify-center">

      <div className="max-w-md text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl">
          {icon}
        </div>

        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>

        {action && (
          <div className="mt-5">
            {action}
          </div>
        )}

      </div>

    </div>
  );
};

export default EmptyState;