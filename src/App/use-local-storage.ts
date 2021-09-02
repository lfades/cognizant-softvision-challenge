import React from "react";

import {LOCAL_STORAGE_ENABLED} from "../api/constants";

export default function useLocalStorage<S>(key: string, initialState: S | (() => S)) {
  const [state, setState] = React.useState(initialState);
  const [ready, setReady] = React.useState(false);
  const dispatch: typeof setState = React.useCallback(
    (value) => {
      if (LOCAL_STORAGE_ENABLED && window?.localStorage) {
        value = typeof value === "function" ? (value as any)(state) : value;
        localStorage.setItem(key, JSON.stringify(value));
      }

      return setState(value);
    },
    [key, state],
  );

  React.useEffect(() => {
    if (LOCAL_STORAGE_ENABLED && window?.localStorage) {
      const localState = window.localStorage.getItem(key);

      if (localState) setState(JSON.parse(localState));
    }
    setReady(true);
  }, [key]);

  return [state, dispatch, ready] as const;
}
