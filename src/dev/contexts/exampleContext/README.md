# Use this context structure as an example

- Just copy the folder
- Rename it
- Open index.ts and rename the context namespace name

## How to use

- import it
  import { ExampleContext } from './...';

#### Provide it

```
...
<ExampleContext.Provider>...</ExampleContext.Provider>
...
```

#### Use it

```
...
const { count, setState } = ExampleContext.useContext();
...
```
