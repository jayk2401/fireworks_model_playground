import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import axios from 'axios'
import ConversationFeed from './conversationFeed'
import './App.css'

function App() {

  type Model = {
    name: string;
    title: string;
  };

  type Message = {
    role: string;
    message: string;
  };

  // const [count, setCount] = useState(0)
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>('qwen3-30b-a3b')
  const [prompt, setPrompt] = useState<string>('')
  const [continuedPrompt, setContinuedPrompt] = useState<string>('')

  const [messages, setMessages] = useState<{ role: string; message: string }[]>([])

  const [responseId, setResponseId] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get('https://app.fireworks.ai/api/models/mini-playground')
      .then((res) => setModels(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const promptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }

  const continuedPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContinuedPrompt(e.target.value)
  }

  const handleReset = () => {
    setResponseId('')
    setMessages([])
    setSelectedModel('qwen3-30b-a3b')
  }

  const handleInitialChatSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:8000/chat_request", { model: selectedModel, prompt: prompt });
      console.log("Response:", response.data);

      const userMessage: Message = {
        role: "User",
        message: prompt,
      };

      const systemMessage: Message = {
        role: "System",
        message: response.data.response,
      }

      setMessages((prevMessages) => [...prevMessages, userMessage, systemMessage]);
      setResponseId(response.data.response_id)
      setLoading(false)
    } catch (error) {
      console.error("Error posting item:", error);
    }
  };

  const handleContinuedChatSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:8000/chat_request_continued", { model: selectedModel, prompt: continuedPrompt, response_id: responseId });
      console.log("Response:", response.data);

      const userMessage: Message = {
        role: "User",
        message: continuedPrompt,
      };

      const systemMessage: Message = {
        role: "System",
        message: response.data.response,
      }

      setMessages((prevMessages) => [...prevMessages, userMessage, systemMessage]);
      // setResponseId(response.data.response_id)
      setLoading(false)
    } catch (error) {
      console.error("Error posting item:", error);
    }
  };

  const modelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fullModelPath = e.target.value
    const modelName = fullModelPath.split('/').pop()
    setSelectedModel(modelName ?? null)
  }

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

      {!responseId && (
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
                // onChange={(e) => setSelectedModel(String(e.target.value))}
                onChange={modelChange}
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
                onChange={promptChange}
              />
            </div>
          </div>

          {!loading && (
            <button
              type="button"
              onClick={handleInitialChatSubmit}
              className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            >
              Let's go!
            </button>
          )}
          {loading && (
            <svg
              className="h-8 w-8 animate-spin text-purple-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
        </div>
      )}
      {responseId && (
        <>
          <ConversationFeed messages={messages} />
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[40%] flex gap-2 justify-center">
            {!loading && (
              <>
                <textarea
                  // type="text"
                  placeholder="Continue the conversation..."
                  onChange={continuedPromptChange}
                  className="w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleContinuedChatSubmit}
                  className="w-1/4 rounded-md bg-indigo-600 px-2 py-1 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/4 rounded-md bg-purple-600 px-2 py-1 text-sm text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Start over?
                </button>
              </>
            )}
            {loading && (

              <svg
                className="h-8 w-8 animate-spin text-purple-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>

            )}
          </div>

        </>
      )}
    </>
  )
}

export default App
