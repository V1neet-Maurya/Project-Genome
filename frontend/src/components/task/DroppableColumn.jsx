import { useDroppable } from "@dnd-kit/core";

import DraggableTask from "./DraggableTask";

const columnStyles = {
  Todo: "bg-slate-400",
  "In Progress": "bg-purple-500",
  "In Review": "bg-amber-400",
  Completed: "bg-emerald-400",
};

const DroppableColumn = ({
  id,
  title,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[420px] rounded-2xl border p-4 transition ${
        isOver
          ? "border-purple-500/50 bg-purple-500/[0.04]"
          : "border-white/[0.07] bg-[#0b111c]"
      }`}
    >
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              columnStyles[title] ||
              "bg-slate-400"
            }`}
          />

          <h2 className="text-sm font-semibold text-slate-200">
            {title}
          </h2>

        </div>

        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/[0.06] px-2 text-xs text-slate-400">
          {tasks.length}
        </span>

      </div>

      {/* Tasks */}

      <div className="space-y-3">

        {tasks.map((task) => (
          <DraggableTask
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-white/[0.07]">

            <p className="text-sm text-slate-600">
              Drop tasks here
            </p>

          </div>
        )}

      </div>
    </div>
  );
};

export default DroppableColumn;