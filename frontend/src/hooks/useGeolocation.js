import { useState, useEffect } from "react";

// Reads the donor's/requester's approximate location so nearby-donor
// matching (currently simulated, real logic lands with the backend in
// later experiments) has coordinates to work with. Permission is only
// requested once, on mount, wherever this hook is used.
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | granted | denied | unsupported

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("locating");

    const watcher = navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );

    return () => {
      if (typeof watcher === "number") navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  return { location, status };
}
