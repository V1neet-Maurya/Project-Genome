export const calculateDeadlineMetrics = ({
  tasks = [],
  deadline,
}) => {
  const now = new Date();

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "completed" ||
      task.status === "done"
  ).length;

  const remainingTasks =
    Math.max(
      0,
      totalTasks - completedTasks
    );

  const blockedTasks = tasks.filter(
    (task) =>
      task.status === "blocked"
  ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "in-progress"
    ).length;

  const overdueTasks =
    tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      return (
        new Date(task.dueDate) <
          now &&
        task.status !== "completed" &&
        task.status !== "done"
      );
    }).length;

  const progress =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  /*
   * We use completed tasks over the
   * recent project lifetime to estimate
   * current velocity.
   */

  const projectStart =
    tasks.reduce(
      (earliest, task) => {
        if (!task.createdAt) {
          return earliest;
        }

        const date =
          new Date(task.createdAt);

        return date < earliest
          ? date
          : earliest;
      },
      now
    );

  const daysElapsed = Math.max(
    1,
    Math.ceil(
      (now - projectStart) /
        (1000 * 60 * 60 * 24)
    )
  );

  const velocity =
    completedTasks /
    daysElapsed;

  const daysRemaining = deadline
    ? Math.ceil(
        (new Date(deadline) - now) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const requiredVelocity =
    daysRemaining &&
    daysRemaining > 0
      ? remainingTasks /
        daysRemaining
      : null;

  let status = "on-track";

  if (
    deadline &&
    new Date(deadline) < now
  ) {
    status = "delayed";
  } else if (
    requiredVelocity !== null &&
    velocity < requiredVelocity
  ) {
    status = "at-risk";
  }

  return {
    totalTasks,
    completedTasks,
    remainingTasks,
    blockedTasks,
    inProgressTasks,
    overdueTasks,
    progress,
    velocity: Number(
      velocity.toFixed(2)
    ),
    daysRemaining,
    requiredVelocity:
      requiredVelocity === null
        ? null
        : Number(
            requiredVelocity.toFixed(2)
          ),
    status,
  };
};