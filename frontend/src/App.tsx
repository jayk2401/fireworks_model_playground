import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import axios from 'axios'
import ConversationFeed from './conversationFeed'
import './App.css'

function App() {

  type Message = {
    role: string;
    message: string;
    metadata?: string;
  };

  const [models, setModels] = useState<string[]>([]);

  const [selectedModel, setSelectedModel] = useState<string | null>('qwen3-30b-a3b')
  const [prompt, setPrompt] = useState<string>('')
  const [continuedPrompt, setContinuedPrompt] = useState<string>('')

  // const [messages, setMessages] = useState<{ role: string; message: string }[]>([])
  const [messages, setMessages] = useState<Message[]>([]);

  const [responseId, setResponseId] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [chatBegun, setChatBegun] = useState(false)

  useEffect(() => {
    axios.get('https://app.fireworks.ai/api/models/mini-playground')
      .then((res) => {
        let modelNames = []
        for (let i = 0; i < res.data.length; i++) {
          let modelName = res.data[i].name
          modelName = modelName.split("/").pop()
          modelNames.push(modelName)
        }
        setModels(modelNames)
      })
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
    setChatBegun(false)
    setSelectedModel('qwen3-30b-a3b')
    setPrompt('')
  }

  const getCurrentTime = () => {
    const now: Date = new Date();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles', // PST/PDT based on current date
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const time: string = now.toLocaleTimeString('en-US', options);

    console.log(time); // e.g. "14:07"
    return time
  }

  const handleInitialChatSubmit1 = async () => {

    if (!prompt) {
      setError(true)
      return
    }
    setError(false)
    setLoading(true)

    let currentTimeUser = getCurrentTime()

    const userMessage: Message = {
      role: "User",
      message: prompt,
      metadata: currentTimeUser
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setChatBegun(true)


    const eventSource = new EventSource(`http://localhost:8000/chat_request1?model=${selectedModel}&prompt=${prompt}`);

    let chunkText: string = ''
    let begunAdding = false

    const startTime = new Date()
    let totalTokens = 0

    eventSource.onmessage = (event) => {

      const data = JSON.parse(event.data);
      if ('response_id' in data) {
        setResponseId(data.response_id)
      }
      if ('delta' in data) {
        setLoading(false)

        const delta = data.delta;
        chunkText += delta
        totalTokens += 1

        if (!begunAdding) {
          let currentTimeSystem = getCurrentTime()
          const firstTokenTime = new Date()
          const diffInSecondsFirstToken = Math.round((firstTokenTime.getTime() - startTime.getTime()) / 1000)

          const systemMessage: Message = {
            role: "System",
            message: chunkText,
            metadata: `${currentTimeSystem} - ${diffInSecondsFirstToken}s to first token`
          }
          setMessages((prevMessages) => [...prevMessages, systemMessage]);
          begunAdding = true
        } else {
          // Update last message in array (the one we just added)
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastIndex = updatedMessages.length - 1;

            if (updatedMessages[lastIndex]?.role === "System") {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                message: chunkText,
              };
            }

            return updatedMessages;
          });
        }
      }
    }

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      console.log(chunkText)
      eventSource.close();

      const finalEndTime = new Date()
      const totalSecondsResponse = Math.round((finalEndTime.getTime() - startTime.getTime()) / 1000)

      const tokensPerSecond = Math.round(totalTokens / totalSecondsResponse)

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastIndex = updatedMessages.length - 1;

        if (updatedMessages[lastIndex]?.role === "System") {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            metadata: `${updatedMessages[lastIndex].metadata ?? ''} - ${totalSecondsResponse}s total response time - ${tokensPerSecond} tokens per second - ${totalTokens} total tokens`
          };
        }

        return updatedMessages;
      });


    };

    return () => {
      console.log("** FNISHED")
      setLoading(false)
      // console.log(chunkArr)
      eventSource.close();
    };

  };


  const handleContinuedChatSubmit1 = async () => {
    if (!continuedPrompt) {
      setError(true)
      return
    }
    let currentTime = getCurrentTime()

    const userMessage: Message = {
      role: "User",
      message: continuedPrompt,
      metadata: currentTime
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setLoading(true)

    const eventSource = new EventSource(`http://localhost:8000/chat_request_continued1?model=${selectedModel}&prompt=${continuedPrompt}&response_id=${responseId}`);

    let chunkText: string = ''
    let begunAdding = false

    const startTime = new Date()
    let totalTokens = 0

    eventSource.onmessage = (event) => {
      setLoading(false)

      const data = JSON.parse(event.data);
      const delta = data.delta;

      chunkText += delta
      totalTokens += 1


      if (!begunAdding) {

        const firstTokenTime = new Date()
        const diffInSecondsFirstToken = Math.round((firstTokenTime.getTime() - startTime.getTime()) / 1000)
        let currentTimeSystem = getCurrentTime()

        const systemMessage: Message = {
          role: "System",
          message: chunkText,
          metadata: `${currentTimeSystem} - ${diffInSecondsFirstToken}s to first token`
        }
        setMessages((prevMessages) => [...prevMessages, systemMessage]);
        begunAdding = true
      } else {
        // Update last message in array (the one we just added)
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastIndex = updatedMessages.length - 1;

          if (updatedMessages[lastIndex]?.role === "System") {
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              message: chunkText,
            };
          }

          return updatedMessages;
        });
      }
    }

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      console.log(chunkText)
      eventSource.close();

      const finalEndTime = new Date()
      const totalSecondsResponse = Math.round((finalEndTime.getTime() - startTime.getTime()) / 1000)

      const tokensPerSecond = Math.round(totalTokens / totalSecondsResponse)

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastIndex = updatedMessages.length - 1;

        if (updatedMessages[lastIndex]?.role === "System") {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            metadata: `${updatedMessages[lastIndex].metadata ?? ''} - ${totalSecondsResponse}s total response time - ${tokensPerSecond} tokens per second - ${totalTokens} total tokens`
          };
        }

        return updatedMessages;
      });



    };

    return () => {
      console.log("** FNISHED")
      setLoading(false)
      // console.log(chunkArr)
      eventSource.close();
    };

  };

  const modelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fullModelPath = e.target.value
    const modelName = fullModelPath.split('/').pop()
    setSelectedModel(modelName ?? null)
  }

  return (
    <>
      <div className="flex justify-center m-6">
        <a href="https://fireworks.ai/" target="_blank">
          <img src={'https://cdn.sanity.io/images/pv37i0yn/production/df64b2d19687cef1b12f8c0bca7d979faf9fe7c0-215x24.svg'} className="logo" alt="Fireworks logo" />
        </a>

      </div>


      {!chatBegun && (
        <div className="mx-auto  max-w-sm items-center gap-x-4 space-y-4 rounded-xl bg-white p-6 shadow-lg">
          <div>
            <label htmlFor="location" className="block text-sm/6 font-medium text-gray-900">
              Pick a model:
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="model"
                name="model"
                value={selectedModel ?? ''}
                // onChange={(e) => setSelectedModel(String(e.target.value))}
                onChange={modelChange}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              >

                {models.map(model => (
                  <option key={model} value={model}>
                    {model}
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


          <div className="space-x-4">
            <button
              type="button"
              onClick={handleInitialChatSubmit1}
              className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            >
              Let's go!
            </button>
            {error && <span className="text-sm text-red-600">Please enter a prompt.</span>}
          </div>

        </div>
      )}
      {chatBegun && (
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
                  onClick={handleContinuedChatSubmit1}
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
