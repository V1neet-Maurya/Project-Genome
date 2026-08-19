const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
  console.error(
    `${req.method} ${req.originalUrl}`,
    err
  );

  const statusCode =
    res.statusCode >= 400
      ? res.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      err.message ||
      "Internal server error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorMiddleware;