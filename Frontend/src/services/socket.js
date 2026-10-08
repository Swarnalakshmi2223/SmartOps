import { io } from "socket.io-client";

const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5000";

let socket = null;
const listeners = new Map();

const attachListeners = () => {
    if (!socket) {
        return;
    }

    listeners.forEach((handlers, event) => {
        handlers.forEach((handler) => socket.on(event, handler));
    });
};

const connect = (token) => {
    if (!token) {
        return null;
    }

    if (socket && socket.auth?.token === token) {
        if (!socket.connected) {
            socket.connect();
        }

        return socket;
    }

    disconnect();

    socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.info("SmartOps real-time connection established");
    });

    socket.on("connect_error", (error) => {
        console.error("SmartOps real-time connection failed:", error.message);
    });

    attachListeners();

    return socket;
};

const disconnect = () => {
    if (!socket) {
        return;
    }

    socket.removeAllListeners("connect");
    socket.removeAllListeners("connect_error");
    socket.disconnect();
    socket = null;
};

const on = (event, handler) => {
    if (!listeners.has(event)) {
        listeners.set(event, new Set());
    }

    listeners.get(event).add(handler);

    if (socket) {
        socket.on(event, handler);
    }

    return () => off(event, handler);
};

const off = (event, handler) => {
    const handlers = listeners.get(event);

    if (!handlers) {
        return;
    }

    handlers.delete(handler);

    if (socket) {
        socket.off(event, handler);
    }

    if (handlers.size === 0) {
        listeners.delete(event);
    }
};

const socketService = {
    connect,
    disconnect,
    on,
    off
};

export default socketService;
