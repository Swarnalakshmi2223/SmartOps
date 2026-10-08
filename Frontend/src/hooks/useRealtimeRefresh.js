import { useEffect, useRef } from "react";
import socketService from "../services/socket";

const useRealtimeRefresh = (callback, events) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const unsubscribeHandlers = events.map((event) =>
            socketService.on(event, () => callbackRef.current())
        );

        return () => {
            unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
        };
    }, [events.join("|")]);
};

export default useRealtimeRefresh;
