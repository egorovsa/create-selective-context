import React from 'react';
import { createSelectiveContext } from '../index';

// Create demo contexts
const { Provider: CounterProvider, useContext: useCounter } = createSelectiveContext({
  count: 0,
  name: 'Counter Demo',
  isVisible: true
});

const { Provider: UserProvider, useContext: useUser } = createSelectiveContext({
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  },
  settings: {
    theme: 'light',
    notifications: true,
    language: 'en'
  },
  isLoading: false
});

const { Provider: TodoProvider, useContext: useTodo } = createSelectiveContext({
  todos: [
    { id: 1, text: 'Learn createSelectiveContext', completed: false },
    { id: 2, text: 'Build amazing apps', completed: false },
    { id: 3, text: 'Share with community', completed: true }
  ],
  filter: 'all',
  newTodo: ''
});

// Demo Components
const CounterDemo = () => {
  const [count, setState] = useCounter((state) => state.count);
  const [name] = useCounter((state) => state.name);
  const [isVisible] = useCounter((state) => state.isVisible);

  return (
    <div className="demo-section">
      <h3>Counter Demo</h3>
      <p>Name: {name}</p>
      <p>Count: {count}</p>
      <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
      <button onClick={() => setState({ count: count + 1 })}>
        Increment
      </button>
      <button onClick={() => setState({ count: count - 1 })}>
        Decrement
      </button>
      <button onClick={() => setState({ isVisible: !isVisible })}>
        Toggle Visibility
      </button>
    </div>
  );
};

const UserDemo = () => {
  const [user] = useUser((state) => state.user);
  const [theme] = useUser((state) => state.settings.theme);
  const [notifications] = useUser((state) => state.settings.notifications);
  const [, setState] = useUser((state) => state);

  return (
    <div className="demo-section">
      <h3>User Profile Demo</h3>
      <div>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Age: {user.age}</p>
        <p>Theme: {theme}</p>
        <p>Notifications: {notifications ? 'On' : 'Off'}</p>
      </div>
      <button onClick={() => setState({
        user: { ...user, name: user.name === 'John Doe' ? 'Jane Smith' : 'John Doe' }
      })}>
        Change Name
      </button>
      <button onClick={() => setState({
        settings: { theme: theme === 'light' ? 'dark' : 'light', notifications, language: 'en' }
      })}>
        Toggle Theme
      </button>
      <button onClick={() => setState({
        settings: { theme, notifications: !notifications, language: 'en' }
      })}>
        Toggle Notifications
      </button>
    </div>
  );
};

const TodoDemo = () => {
  const [todos] = useTodo((state) => state.todos);
  const [filter] = useTodo((state) => state.filter);
  const [newTodo, setState] = useTodo((state) => state.newTodo);
  const [, setTodoState] = useTodo((state) => state);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodoState(state => ({
        todos: [...state.todos, {
          id: Date.now(),
          text: newTodo,
          completed: false
        }],
        newTodo: ''
      }));
    }
  };

  const toggleTodo = (id: number) => {
    setTodoState(state => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  return (
    <div className="demo-section">
      <h3>Todo App Demo</h3>
      <div>
        <p>Total: {totalCount} | Completed: {completedCount}</p>
        <input
          value={newTodo}
          onChange={(e) => setState({ newTodo: e.target.value })}
          placeholder="Add new todo"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <div>
        <button onClick={() => setTodoState({ filter: 'all' })}>
          All ({totalCount})
        </button>
        <button onClick={() => setTodoState({ filter: 'active' })}>
          Active ({totalCount - completedCount})
        </button>
        <button onClick={() => setTodoState({ filter: 'completed' })}>
          Completed ({completedCount})
        </button>
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PerformanceDemo = () => {
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  
  // This component only subscribes to count, so it won't re-render when name changes
  const [count] = useCounter((state) => state.count);
  const [, setCounterState] = useCounter((state) => state);

  const resetRenderCount = () => {
    renderCountRef.current = 0;
    // Force a re-render to update the display
    setCounterState({ count });
  };

  return (
    <div className="demo-section">
      <h3>Performance Demo</h3>
      <p>This component only subscribes to 'count'</p>
      <p>Count: {count}</p>
      <p>Render count: {renderCountRef.current}</p>
      <button onClick={resetRenderCount}>Reset Render Count</button>
      <p>Try changing the name in Counter Demo - this component won't re-render!</p>
    </div>
  );
};

// Main Dev Layout
export const DevLayout: React.FC = () => {
  return (
    <div className="dev-container">
      <header className="dev-header">
        <h1>createSelectiveContext Demo</h1>
        <p>A lightweight React context factory with selective subscriptions</p>
      </header>

      <main className="dev-main">
        <section className="install-section">
          <h2>Installation</h2>
          <pre><code>npm install create-selective-context</code></pre>
        </section>

        <CounterProvider>
          <UserProvider>
            <TodoProvider>
              <section className="demos-section">
                <h2>Live Demos</h2>
                <CounterDemo />
                <UserDemo />
                <TodoDemo />
                <PerformanceDemo />
              </section>
            </TodoProvider>
          </UserProvider>
        </CounterProvider>

        <section className="code-examples">
          <h2>Code Examples</h2>
          <div className="code-block">
            <h3>Basic Usage</h3>
            <pre><code>{`import { createSelectiveContext } from 'create-selective-context';

const { Provider, useContext } = createSelectiveContext({
  count: 0,
  name: 'Counter'
});

function Counter() {
  const [count, setState] = useContext((state) => state.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setState({ count: count + 1 })}>
        Increment
      </button>
    </div>
  );
}`}</code></pre>
          </div>

          <div className="code-block">
            <h3>Selective Subscriptions</h3>
            <pre><code>{`// Component A - only re-renders when count changes
const [count] = useContext((state) => state.count);

// Component B - only re-renders when name changes  
const [name] = useContext((state) => state.name);

// Component C - only re-renders when user.age changes
const [age] = useContext((state) => state.user.age);`}</code></pre>
          </div>
        </section>

        <section className="features-section">
          <h2>Features</h2>
          <ul>
            <li>✅ Selective subscriptions - only re-render when needed</li>
            <li>✅ TypeScript support - full type safety</li>
            <li>✅ useSyncExternalStore - modern React pattern</li>
            <li>✅ Zero dependencies - lightweight</li>
            <li>✅ Easy migration from standard Context</li>
            <li>✅ Callback support for state changes</li>
          </ul>
        </section>
      </main>

      <footer className="dev-footer">
        <p>Built with ❤️ for the React community</p>
      </footer>
    </div>
  );
};