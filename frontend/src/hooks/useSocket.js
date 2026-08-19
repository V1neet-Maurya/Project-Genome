import { useEffect } from "react";
import { useSelector } from "react-redux";

import socket from "../services/socket";

const useSocket = () => {
  const { user } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log(
        "Connected:",
        socket.id
      );

      socket.emit(
        "join-user",
        user._id
      );
    };

    socket.on(
      "connect",
      handleConnect
    );

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );
    };
  }, [user?._id]);
};

export default useSocket;