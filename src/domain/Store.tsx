import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { App } from "antd";
import { initialState, validState, type DataState } from "./model";
const KEY = "dalton-styles:workspace:v1";
const Context = createContext<{
  data: DataState;
  setData: Dispatch<SetStateAction<DataState>>;
  storageError: boolean;
  reset: () => void;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { message } = App.useApp();
  const [storageError, setStorageError] = useState(false);
  const [corrupt, setCorrupt] = useState(false);
  const [data, setData] = useState<DataState>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) return initialState();
      const value = JSON.parse(saved);
      return validState(value) ? value : initialState();
    } catch {
      return initialState();
    }
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && !validState(JSON.parse(raw))) setCorrupt(true);
    } catch {
      setCorrupt(true);
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    if (corrupt) message.warning("本地演示数据无法读取，已恢复初始样例。");
  }, [corrupt, message]);
  const reset = useCallback(
    () =>
      setData((current) => ({
        ...initialState(),
        density: current.density,
        columns: current.columns,
      })),
    [],
  );
  return (
    <Context.Provider value={{ data, setData, storageError, reset }}>
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const store = useContext(Context);
  if (!store) throw new Error("WorkspaceProvider missing");
  return store;
}
