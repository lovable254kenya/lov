import { useState, useCallback, useEffect, useRef } from "react";
import { getCurrentDevicePosition, watchDevicePosition } from "@/lib/nativePermissions";

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (requested) return;
    
    setRequested(true);
    setLoading(true);
    setPermissionDenied(false);

    getCurrentDevicePosition()
      .then((pos) => {
        setPosition({
          latitude: pos.latitude,
          longitude: pos.longitude,
        });
        setLoading(false);
        setPermissionDenied(false);
      })
      .catch((err: any) => {
        setError(err.message);
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED || err.message?.toLowerCase().includes("denied")) {
          setPermissionDenied(true);
        }
      });

    watchDevicePosition(
      (pos) => {
        setPosition({
          latitude: pos.latitude,
          longitude: pos.longitude,
        });
        setPermissionDenied(false);
      },
      (err: any) => {
        if (err.code === err.PERMISSION_DENIED || err.message?.toLowerCase().includes("denied")) {
          setPermissionDenied(true);
        }
      }
    ).then((clearWatch) => {
      watchIdRef.current = window.setTimeout(() => clearWatch(), 2147483647);
    }).catch((err: any) => {
      setError(err.message);
      setLoading(false);
    });
  }, [requested]);

  // Force request location (resets requested state)
  const forceRequestLocation = useCallback(() => {
    setRequested(false);
    setError(null);
    setPermissionDenied(false);
    // Small delay to allow state reset
    setTimeout(() => {
      setRequested(true);
      setLoading(true);

      getCurrentDevicePosition()
        .then((pos) => {
          setPosition({
            latitude: pos.latitude,
            longitude: pos.longitude,
          });
          setLoading(false);
          setPermissionDenied(false);
        })
        .catch((err: any) => {
          setError(err.message);
          setLoading(false);
          if (err.code === err.PERMISSION_DENIED || err.message?.toLowerCase().includes("denied")) {
            setPermissionDenied(true);
          }
        });
    }, 100);
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        clearTimeout(watchIdRef.current);
      }
    };
  }, []);

  return { position, error, loading, permissionDenied, requestLocation, forceRequestLocation };
};

// Helper function to calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
