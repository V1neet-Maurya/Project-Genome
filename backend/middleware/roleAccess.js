const roleAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.projectRole) {
      return res.status(403).json({
        success: false,
        message:
          "Project role could not be determined",
      });
    }

    if (
      !allowedRoles.includes(
        req.projectRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default roleAccess;