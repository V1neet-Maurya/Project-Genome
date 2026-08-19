import TaskCard from "./TaskCard";

const columnStyles = {
  Todo: {
    dot: "bg-slate-400",
  },

  "In Progress": {
    dot: "bg-purple-500",
  },

  "In Review": {
    dot: "bg-amber-400",
  },

  Completed: {
    dot: "bg-emerald-400",
  },
};

const TaskColumn = ({
  title,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const style =
    columnStyles[title] || columnStyles.Todo;

  return (
    <div className="min-h-[420px] rounded-2xl border border-white/[0.07] bg-[#0b111c] p-4">

      {/* Column header */}

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span
            className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
          />

          <h2 className="text-sm font-semibold text-slate-200">
            {title}
          </h2>

        </div>

        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/[0.06] px-2 text-xs font-medium text-slate-400">
          {tasks.length}
        </span>

      </div>

      {/* Tasks */}

      <div className="space-y-3">

        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-white/[0.07]">

            <div className="text-center">

              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-slate-600">
                —
              </div>

              <p className="text-sm text-slate-600">
                No tasks
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default TaskColumn;