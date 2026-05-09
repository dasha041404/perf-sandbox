import { useState } from 'react'
import { TrashIcon } from './assets'

function App() {
  const [count, setCount] = useState(0)

  return (
        <div>
          <TrashIcon />
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Counter</h2>
            <p>Count: <strong>{count}</strong></p>
            <button onClick={() => setCount(count + 1)} style={{ marginRight: '10px', padding: '5px 15px' }}>
              Increment
            </button>
            <button onClick={() => setCount(count - 1)} style={{ marginRight: '10px', padding: '5px 15px' }}>
              Decrement
            </button>
            <button onClick={() => setCount(0)} style={{ padding: '5px 15px' }}>
              Reset
            </button>
          </div>
        </div>
  )
}

export default App
