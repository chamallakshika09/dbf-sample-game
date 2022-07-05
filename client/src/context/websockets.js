import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import config from '../config';

const WebSocketContext = createContext(null);

export { WebSocketContext };

const WebSocketProvider = ({ children, user, project }) => {
  const [websocket, setWebSocket] = useState(null);

  useEffect(() => {
    const socketCreated = io(config.BASE_URL);

    setWebSocket(socketCreated);
  }, [user, project]);

  if (!websocket) {
    return <>{children}</>;
  }

  return <WebSocketContext.Provider value={websocket}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
