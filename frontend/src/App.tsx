import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import axios from 'axios'

import './App.css'

function App() {

  type Model = {
    name: string;
    title: string;
    // add more fields as needed
  };

  // const [count, setCount] = useState(0)
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get('https://app.fireworks.ai/api/models/mini-playground')
      .then((res) => setModels(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}

      <div className="mx-auto  max-w-sm items-center gap-x-4 space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div>
          <label htmlFor="location" className="block text-sm/6 font-medium text-gray-900">
            Pick a model:
          </label>
          <div className="mt-2 grid grid-cols-1">
            <select
              id="model"
              name="model"
              // defaultValue="Canada"
              value={selectedModel ?? ''}
              onChange={(e) => setSelectedModel(String(e.target.value))}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            >

              {models.map(model => (
                <option key={model.name} value={model.name}>
                  {model.title}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm/6 font-medium text-gray-900">
            Prompt
          </label>
          <div className="mt-2">
            <textarea
              id="comment"
              name="comment"
              placeholder="What is the meaning of life?"
              rows={4}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              defaultValue={''}
            />
          </div>
        </div>


        <button
          type="button"
          className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          Let's go!
        </button>
      </div>
    </>
  )
}

export default App
