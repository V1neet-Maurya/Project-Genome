import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import TaskCard from "./TaskCard";

const DraggableTask = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={
        isDragging
          ? "opacity-40"
          : "opacity-100"
      }
    >
      <TaskCard
        task={task}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DraggableTask;