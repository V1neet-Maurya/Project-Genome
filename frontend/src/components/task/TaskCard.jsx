const priorityStyles = {
  critical:
    "border-red-500/20 bg-red-500/10 text-red-400",

  high:
    "border-orange-500/20 bg-orange-500/10 text-orange-400",

  medium:
    "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

  low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const TaskCard = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  dragAttributes,
  dragListeners,
}) => {
  return (
    <div
      className="
        group
        rounded-xl
        border border-white/[0.07]
        bg-[#0f1622]
        p-4
        transition duration-200
        hover:-translate-y-0.5
        hover:border-purple-500/30
        hover:bg-[#111a28]
      "
    >
      {/* TOP */}
      <div className="mb-3 flex items-start justify-between gap-3">

        {/* DRAG HANDLE */}
        <h3
          {...dragAttributes}
          {...dragListeners}
          className="
            line-clamp-2
            cursor-grab
            text-sm
            font-semibold
            leading-5
            text-slate-100
            active:cursor-grabbing
          "
        >
          {task.title}
        </h3>

        {/* ACTION BUTTONS */}
        <div className="flex shrink-0 items-center gap-1">

          {/* EDIT */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (onEdit) {
                onEdit(task);
              }
            }}
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-lg
              text-slate-500
              opacity-0
              transition
              group-hover:opacity-100
              hover:bg-white/[0.06]
              hover:text-white
            "
            title="Edit task"
          >
            ✎
          </button>

          {/* DELETE */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();

              if (onDelete) {
                onDelete(task._id);
              }
            }}
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-lg
              text-red-400
              opacity-0
              transition
              group-hover:opacity-100
              hover:bg-red-500/10
              hover:text-red-300
            "
            title="Delete task"
          >
            🗑
          </button>

        </div>
      </div>

      {/* DESCRIPTION */}
      {task.description && (
        <p className="mb-4 line-clamp-2 text-xs leading-5 text-slate-500">
          {task.description}
        </p>
      )}

      {/* BOTTOM */}
      <div className="flex items-center justify-between gap-2">

        {/* STATUS */}
        <select
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          value={task.status}
          onChange={(e) => {
            e.stopPropagation();

            onStatusChange(
              task._id,
              e.target.value
            );
          }}
          className="
            h-8
            max-w-[125px]
            rounded-lg
            border border-white/[0.08]
            bg-[#080d16]
            px-2
            text-xs
            text-slate-300
            outline-none
            focus:border-purple-500/60
          "
        >
          <option value="todo">
            Todo
          </option>

          <option value="in-progress">
            In Progress
          </option>

          <option value="in-review">
            In Review
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

        {/* PRIORITY */}
        <span
          className={`
            rounded-full
            border
            px-2.5
            py-1
            text-[11px]
            font-medium
            capitalize
            ${
              priorityStyles[task.priority] ||
              priorityStyles.medium
            }
          `}
        >
          {task.priority}
        </span>

      </div>
    </div>
  );
};

export default TaskCard;