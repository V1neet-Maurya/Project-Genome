export const hasProjectAccess = (
  project,
  userId
) => {
  if (!project || !userId) {
    return {
      allowed: false,
      role: null,
    };
  }

  const currentUserId =
    userId.toString();

  // =====================================================
  // OWNER
  // =====================================================

  if (
    project.owner &&
    project.owner.toString() ===
      currentUserId
  ) {
    return {
      allowed: true,
      role: "owner",
    };
  }

  // =====================================================
  // MEMBER
  // =====================================================

  const member =
    project.members?.find((member) => {
      const memberUserId =
        member?.user?._id ||
        member?.user;

      return (
        memberUserId &&
        memberUserId.toString() ===
          currentUserId
      );
    });

  if (!member) {
    return {
      allowed: false,
      role: null,
    };
  }

  return {
    allowed: true,
    role: member.role || "viewer",
  };
};