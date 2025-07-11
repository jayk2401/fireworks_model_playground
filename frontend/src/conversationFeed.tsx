import { useRef, useEffect } from 'react';
import { Fragment } from 'react'
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon, UserPlusIcon } from '@heroicons/react/20/solid'
import ReactMarkdown from 'react-markdown'


type Message = {
    role: string;
    message: string;
    metadata?: string
};
type Messages = {
    messages: Message[];
};

export default function ConversationFeed({ messages }: Messages) {

    const ulRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (ulRef.current) {
            // Scroll to the bottom
            ulRef.current.scrollTo({
                top: ulRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]); // run this effect every time items change

    console.log(messages)
    return (

        <div className="flow-root">
            <ul ref={ulRef} role="list" className="-mb-8 border-2 border-purple-700 rounded-lg p-4 h-[80vh] overflow-y-auto">
                {messages.map((messageItem) => (
                    <li key={messageItem.message}
                    >
                        {/* <div className="relative p-4 border-b-1 border-purple-500 bg-gray-100"> */}
                        <div className={`relative p-4  ${messageItem.role === 'System' ? 'bg-gray-100' : 'bg-white'}`}>

                            <div className="relative flex items-start space-x-3">

                                <>
                                    <div>
                                        <div className="relative px-1">
                                            <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                                {messageItem.role === 'System' ? <UserPlusIcon aria-hidden="true" className="size-6 text-purple-500" /> : <UserCircleIcon aria-hidden="true" className="size-6 text-blue-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div>
                                            <div className="text-sm">
                                                <a href="/" className="font-medium text-gray-900">
                                                    {messageItem.role}
                                                </a>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">{messageItem.metadata}</p>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-line prose max-w-none">
                                            <ReactMarkdown>
                                                {messageItem.message}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </>

                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>


    )
}
