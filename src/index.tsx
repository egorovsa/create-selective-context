import {
  createContext,
  useContext as useReactContext,
  useRef,
  useCallback,
  useSyncExternalStore,
} from 'react';

/**
 * Creates a React context and associated hooks to manage state
 * with useSyncExternalStore. Allows subscribing to state changes.
 *
 * @param initialState - The initial state value
 * @param updateContextCallback - Optional callback when state changes
 * @returns Object with Context, Provider, and useContext hook
 */
export const createSelectiveContext = <State,>(
  initialState: State,
  updateContextCallback?: (newState: State) => void,
) => {
  type NewData = Partial<State> | ((state: State) => Partial<State>);

  function useContextStore(initialData: State) {
    const data = useRef<State>(initialData);
    const subscribers = useRef(new Set<() => void>());
    const get = useCallback(() => data.current, []);

    const set = useCallback((newData: NewData) => {
      const updatedData =
        typeof newData === 'function'
          ? newData(data.current)
          : (newData as object);

      data.current = { ...data.current, ...updatedData };
      subscribers.current.forEach((callback) => callback());
      try {
        updateContextCallback?.(JSON.parse(JSON.stringify(data.current)));
      } catch (error) {
        // Silently handle callback errors to prevent breaking the app
        console.error('Update callback error:', error);
      }
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  type StoreType = ReturnType<typeof useContextStore>;

  const Context = createContext<StoreType | null>(null);

  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Context.Provider value={useContextStore(initialState)}>
      {children}
    </Context.Provider>
  );

  const useContext = <Output,>(
    selector: (state: State) => Output,
  ): [Output, (value: NewData) => void] => {
    const context = useReactContext(Context);

    if (!context) {
      throw new Error('Context creation error');
    }

    const state = useSyncExternalStore(
      context.subscribe,
      () => selector(context.get()),
      () => selector(initialState),
    );

    return [state, context.set];
  };

  return {
    Context,
    Provider,
    useContext,
  };
};
