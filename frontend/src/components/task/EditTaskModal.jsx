import { useEffect, useState } from "react";

const EditTaskModal = ({
  task,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? task.dueDate.split("T")[0]
          : "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    onUpdate(task._id, {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
    });
  };

  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">

      {/* Modal */}
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d111c] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Edit Task
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update the details of your task
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full rounded-lg border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done..."
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>
            </div>

          </div>

          {/* Due Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Due Date
            </label>

            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 active:scale-[0.98]"
            >
              Save Changes
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;