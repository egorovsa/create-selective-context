import { describe, it, expect, vi } from 'vitest';
import { createSelectiveContext } from '../index';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';

describe('createSelectiveContext', () => {
  it('returns context, provider, and useContext', () => {
    const { Context, Provider, useContext } = createSelectiveContext({});
    expect(Context).toBeDefined();
    expect(Provider).toBeDefined();
    expect(useContext).toBeDefined();
  });

  it('provider renders children', () => {
    const TestComponent = () => <div>Test</div>;
    const { Provider } = createSelectiveContext({});
    render(
      <Provider>
        <TestComponent />
      </Provider>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('useContext returns state and setState', () => {
    const { Provider, useContext } = createSelectiveContext({ count: 5 });

    const TestComponent = () => {
      const [count] = useContext((state) => state.count);
      return <div>Test{count}</div>;
    };

    render(
      <Provider>
        <TestComponent />
      </Provider>
    );

    expect(screen.getByText('Test5')).toBeInTheDocument();
  });

  describe('State Updates', () => {
    it('updates state with partial object', () => {
      const { Provider, useContext } = createSelectiveContext({ count: 0, name: 'test' });

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState({ count: count + 1 })}>Increment</button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Count: 0')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });

    it('updates state with function', () => {
      const { Provider, useContext } = createSelectiveContext({ count: 0 });

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState(state => ({ count: state.count + 1 }))}>
              Increment
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Count: 0')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });

    it('preserves other state properties when updating', () => {
      const { Provider, useContext } = createSelectiveContext({ 
        count: 0, 
        name: 'John', 
        age: 25 
      });

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        const [name] = useContext((state) => state.name);
        const [age] = useContext((state) => state.age);
        
        return (
          <div>
            <span>Count: {count}</span>
            <span>Name: {name}</span>
            <span>Age: {age}</span>
            <button onClick={() => setState({ count: count + 1 })}>Increment</button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Age: 25')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Increment'));
      
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Age: 25')).toBeInTheDocument();
    });
  });

  describe('Selective Subscriptions', () => {
    it('only re-renders components that subscribe to changed state', () => {
      const { Provider, useContext } = createSelectiveContext({ 
        count: 0, 
        name: 'John' 
      });

      const CountComponent = vi.fn(() => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState({ name: 'Jane' })}>Change Name</button>
          </div>
        );
      });

      const NameComponent = vi.fn(() => {
        const [name] = useContext((state) => state.name);
        return <span>Name: {name}</span>;
      });

      render(
        <Provider>
          <CountComponent />
          <NameComponent />
        </Provider>
      );

      // Reset mock call counts
      CountComponent.mockClear();
      NameComponent.mockClear();

      // Change name - only NameComponent should re-render
      fireEvent.click(screen.getByText('Change Name'));

      expect(NameComponent).toHaveBeenCalledTimes(1); // Re-rendered
      expect(CountComponent).toHaveBeenCalledTimes(0); // Not re-rendered
    });

    it('handles nested object subscriptions', () => {
      const { Provider, useContext } = createSelectiveContext({
        user: { name: 'John', age: 25 },
        settings: { theme: 'light' }
      });

      const UserComponent = () => {
        const [user] = useContext((state) => state.user);
        return <span>User: {user.name}, {user.age}</span>;
      };

      const SettingsComponent = () => {
        const [settings] = useContext((state) => state.settings);
        return <span>Theme: {settings.theme}</span>;
      };

      const TestComponent = () => {
        const [, setState] = useContext((state) => state);
        return (
          <div>
            <UserComponent />
            <SettingsComponent />
            <button onClick={() => setState({ 
              settings: { theme: 'dark' } 
            })}>
              Change Theme
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('User: John, 25')).toBeInTheDocument();
      expect(screen.getByText('Theme: light')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Change Theme'));

      expect(screen.getByText('User: John, 25')).toBeInTheDocument();
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    });
  });

  describe('Update Callback', () => {
    it('calls update callback when state changes', () => {
      const updateCallback = vi.fn();
      const { Provider, useContext } = createSelectiveContext(
        { count: 0 }, 
        updateCallback
      );

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState({ count: count + 1 })}>Increment</button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      fireEvent.click(screen.getByText('Increment'));

      expect(updateCallback).toHaveBeenCalledWith({ count: 1 });
    });

    it('calls update callback with function-based updates', () => {
      const updateCallback = vi.fn();
      const { Provider, useContext } = createSelectiveContext(
        { count: 0 }, 
        updateCallback
      );

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState(state => ({ count: state.count + 1 }))}>
              Increment
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      fireEvent.click(screen.getByText('Increment'));

      expect(updateCallback).toHaveBeenCalledWith({ count: 1 });
    });
  });

  describe('Error Handling', () => {
    it('throws error when useContext is called outside Provider', () => {
      const { useContext } = createSelectiveContext({ count: 0 });

      const TestComponent = () => {
        useContext((state) => state.count);
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('Context creation error');

      consoleSpy.mockRestore();
    });
  });

  describe('Complex Scenarios', () => {
    it('handles multiple components with different selectors', () => {
      const { Provider, useContext } = createSelectiveContext({
        user: { name: 'John', age: 25 },
        posts: [{ id: 1, title: 'Post 1' }],
        settings: { theme: 'light', notifications: true }
      });

      const UserNameComponent = () => {
        const [name] = useContext((state) => state.user.name);
        return <span>Name: {name}</span>;
      };

      const UserAgeComponent = () => {
        const [age] = useContext((state) => state.user.age);
        return <span>Age: {age}</span>;
      };

      const PostsCountComponent = () => {
        const [count] = useContext((state) => state.posts.length);
        return <span>Posts: {count}</span>;
      };

      const ThemeComponent = () => {
        const [theme] = useContext((state) => state.settings.theme);
        return <span>Theme: {theme}</span>;
      };

      const TestComponent = () => {
        const [, setState] = useContext((state) => state);
        return (
          <div>
            <UserNameComponent />
            <UserAgeComponent />
            <PostsCountComponent />
            <ThemeComponent />
            <button onClick={() => setState({ 
              user: { name: 'Jane', age: 30 } 
            })}>
              Update User
            </button>
            <button onClick={() => setState({ 
              settings: { theme: 'dark', notifications: true } 
            })}>
              Change Theme
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Age: 25')).toBeInTheDocument();
      expect(screen.getByText('Posts: 1')).toBeInTheDocument();
      expect(screen.getByText('Theme: light')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Update User'));

      expect(screen.getByText('Name: Jane')).toBeInTheDocument();
      expect(screen.getByText('Age: 30')).toBeInTheDocument();
      expect(screen.getByText('Posts: 1')).toBeInTheDocument();
      expect(screen.getByText('Theme: light')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Change Theme'));

      expect(screen.getByText('Name: Jane')).toBeInTheDocument();
      expect(screen.getByText('Age: 30')).toBeInTheDocument();
      expect(screen.getByText('Posts: 1')).toBeInTheDocument();
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    });

    it('handles computed values in selectors', () => {
      const { Provider, useContext } = createSelectiveContext({
        items: [
          { id: 1, completed: true },
          { id: 2, completed: false },
          { id: 3, completed: true }
        ]
      });

      const StatsComponent = () => {
        const [total] = useContext((state) => state.items.length);
        const [completed] = useContext((state) => 
          state.items.filter(item => item.completed).length
        );
        const [pending] = useContext((state) => 
          state.items.filter(item => !item.completed).length
        );

        return (
          <div>
            <span>Total: {total}</span>
            <span>Completed: {completed}</span>
            <span>Pending: {pending}</span>
          </div>
        );
      };

      const TestComponent = () => {
        const [, setState] = useContext((state) => state);
        return (
          <div>
            <StatsComponent />
            <button onClick={() => setState({
              items: [
                { id: 1, completed: true },
                { id: 2, completed: true },
                { id: 3, completed: true }
              ]
            })}>
              Complete All
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Total: 3')).toBeInTheDocument();
      expect(screen.getByText('Completed: 2')).toBeInTheDocument();
      expect(screen.getByText('Pending: 1')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Complete All'));

      expect(screen.getByText('Total: 3')).toBeInTheDocument();
      expect(screen.getByText('Completed: 3')).toBeInTheDocument();
      expect(screen.getByText('Pending: 0')).toBeInTheDocument();
    });
  });

  describe('TypeScript Compatibility', () => {
    it('works with TypeScript interfaces', () => {
      interface UserState {
        user: {
          id: string;
          name: string;
          email: string;
        };
        isLoading: boolean;
      }

      const { Provider, useContext } = createSelectiveContext<UserState>({
        user: { id: '1', name: 'John', email: 'john@example.com' },
        isLoading: false
      });

      const TestComponent = () => {
        const [user] = useContext((state) => state.user);
        const [isLoading] = useContext((state) => state.isLoading);
        
        return (
          <div>
            <span>Name: {user.name}</span>
            <span>Loading: {isLoading.toString()}</span>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
    });
  });
});
