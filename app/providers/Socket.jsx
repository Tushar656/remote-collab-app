"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => {
    return useContext(SocketContext);
}


export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // const newSocket = io('http://localhost:8001');                        // FOR DEVELOPMENT
        const newSocket = io('wss://remote-collabe-server.glitch.me/', {
            headers: {
                "user-agent": "mozilla"
            },
            transports: ['websocket']
          });                                        // FOR DEPLOYMENT
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}
