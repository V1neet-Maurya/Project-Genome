import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { toast } from "sonner";

import socket from "../services/socket";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationApi";

import {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  setLoading,
} from "../redux/notificationSlice";

const NotificationBell = () => {
  const dispatch = useDispatch();

  const {
    notifications,
    unreadCount,
  } = useSelector(
    (state) => state.notification
  );

  const [open, setOpen] =
    useState(false);

  const dropdownRef = useRef(null);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const fetchNotifications =
      async () => {
        try {
          dispatch(setLoading(true));

          const response =
            await getNotifications();

          dispatch(
            setNotifications({
              notifications:
                response.data || [],
              unreadCount:
                response.unreadCount || 0,
            })
          );
        } catch (error) {
          console.error(
            "Failed to load notifications",
            error
          );
        } finally {
          dispatch(
            setLoading(false)
          );
        }
      };

    fetchNotifications();
  }, [dispatch]);

  // =====================================================
  // REAL-TIME NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const handleNotification = (
      notification
    ) => {
      if (!notification) {
        return;
      }

      dispatch(
        addNotification(notification)
      );

      toast.info(
        notification.title ||
          "New notification"
      );
    };

    socket.on(
      "new-notification",
      handleNotification
    );

    return () => {
      socket.off(
        "new-notification",
        handleNotification
      );
    };
  }, [dispatch]);

  // =====================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // MARK READ
  // =====================================================

  const handleRead = async (
    notification
  ) => {
    if (notification.read) {
      return;
    }

    try {
      await markNotificationRead(
        notification._id
      );

      dispatch(
        markRead(notification._id)
      );
    } catch (error) {
      toast.error(
        "Failed to update notification"
      );
    }
  };

  // =====================================================
  // MARK ALL
  // =====================================================

  const handleMarkAllRead =
    async () => {
      try {
        await markAllNotificationsRead();

        dispatch(markAllRead());

        toast.success(
          "All notifications marked as read"
        );
      } catch (error) {
        toast.error(
          "Failed to update notifications"
        );
      }
    };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* BELL */}

      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
      >
        <span className="text-lg">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}

      {open && (
        <div className="absolute right-0 top-12 z-[100] w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1320] shadow-2xl">
          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h3 className="font-semibold">
                Notifications
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllRead
                }
                className="text-xs font-medium text-purple-400 hover:text-purple-300"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* LIST */}

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="p-10 text-center">
                <div className="mb-3 text-3xl">
                  🔔
                </div>

                <p className="text-sm font-medium">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={
                      notification._id
                    }
                    type="button"
                    onClick={() =>
                      handleRead(
                        notification
                      )
                    }
                    className={`flex w-full gap-3 border-b border-white/[0.05] px-5 py-4 text-left transition hover:bg-white/[0.03] ${
                      notification.read
                        ? ""
                        : "bg-purple-500/[0.04]"
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      <span
                        className={`block h-2.5 w-2.5 rounded-full ${
                          notification.read
                            ? "bg-slate-700"
                            : "bg-purple-500"
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[10px] text-slate-600">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;