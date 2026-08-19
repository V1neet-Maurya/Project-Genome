import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";

export const createActivity = async ({
  user,
  project,
  action,
  entityType,
  entityId,
  message,
}) => {
  return Activity.create({
    user,
    project,
    action,
    entityType,
    entityId,
    message,
  });
};

export const createNotification = async ({
  user,
  project,
  type,
  title,
  message,
  entityId,
  io,
}) => {
  const notification =
    await Notification.create({
      user,
      project,
      type,
      title,
      message,
      entityId,
    });

  io
    ?.to(`user:${user}`)
    .emit(
      "new-notification",
      notification
    );

  return notification;
};