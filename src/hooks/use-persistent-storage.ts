
"use client";

import { useState, useEffect, useCallback } from 'react';

type PersistentStorageState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export function usePersistentStorage() {
  const [state, setState] = useState<PersistentStorageState>('unsupported');

  const checkPermission = useCallback(async () => {
    if (navigator.storage && navigator.storage.persisted) {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        setState('granted');
      } else {
         const permission = await navigator.permissions.query({ name: 'persistent-storage' });
         setState(permission.state as 'prompt' | 'granted' | 'denied');
      }
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const request = useCallback(async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      if (isPersisted) {
        setState('granted');
        return true;
      } else {
        setState('denied');
        return false;
      }
    }
    return false;
  }, []);

  return { state, request };
}
