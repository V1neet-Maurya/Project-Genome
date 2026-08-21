export const calculateTeamWorkload = (
  tasks = [],
  teamMembers = []
) => {
  return teamMembers.map((member) => {
    const memberId =
      member._id?.toString();

    const memberTasks =
      tasks.filter((task) => {
        const assignedId =
          task.assignedTo?._id?.toString() ||
          task.assignedTo?.toString();

        return (
          assignedId === memberId
        );
      });

    const total =
      memberTasks.length;

    const completed =
      memberTasks.filter(
        (task) =>
          task.status === "completed" ||
          task.status === "done"
      ).length;

    const active =
      memberTasks.filter(
        (task) =>
          task.status === "in-progress"
      ).length;

    const overdue =
      memberTasks.filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        return (
          new Date(task.dueDate) <
            new Date() &&
          task.status !== "completed" &&
          task.status !== "done"
        );
      }).length;

    const blocked =
      memberTasks.filter(
        (task) =>
          task.status === "blocked"
      ).length;

    const highPriority =
      memberTasks.filter(
        (task) =>
          task.priority === "high" ||
          task.priority === "critical"
      ).length;

    /*
     * Workload score is deterministic.
     * AI will interpret it later.
     */

    const workloadScore = Math.min(
      100,
      total * 10 +
        active * 8 +
        overdue * 15 +
        blocked * 15 +
        highPriority * 5
    );

    let workloadLevel =
      "low";

    if (workloadScore >= 80) {
      workloadLevel = "critical";
    } else if (workloadScore >= 60) {
      workloadLevel = "high";
    } else if (workloadScore >= 35) {
      workloadLevel = "medium";
    }

    return {
      member: {
        _id: member._id,
        firstName:
          member.firstName,
        lastName:
          member.lastName,
        email: member.email,
      },

      totalTasks: total,
      completedTasks: completed,
      activeTasks: active,
      overdueTasks: overdue,
      blockedTasks: blocked,
      highPriorityTasks:
        highPriority,

      workloadScore,
      workloadLevel,
    };
  });
};