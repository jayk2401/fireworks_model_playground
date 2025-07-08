import { Fragment } from 'react'
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import ReactMarkdown from 'react-markdown'

const activity = [
    {
        id: 1,
        type: 'comment',
        person: { name: 'Eduardo Benz', href: '#' },
        imageUrl:
            'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        comment:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ',
        date: '6d ago',
    },
    {
        id: 4,
        type: 'comment',
        person: { name: 'Jason Meyers', href: '#' },
        imageUrl:
            'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        comment:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
        date: '2h ago',
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

type Message = {
    role: string;
    message: string;
};
type Messages = {
    messages: Message[];
};

export default function ConversationFeed({ messages }: Messages) {
    console.log(messages)
    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8 border-1 border-purple-700 rounded-lg p-4">
                {messages.map((messageItem) => (
                    <li key={messageItem.message}>
                        {/* <div className="relative p-4 border-b-1 border-purple-500 bg-gray-100"> */}
                        <div className={`relative p-4  ${messageItem.role === 'System' ? 'bg-gray-100' : 'bg-white'}`}>

                            <div className="relative flex items-start space-x-3">

                                <>
                                    <div>
                                        <div className="relative px-1">
                                            <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                                <UserCircleIcon aria-hidden="true" className="size-5 text-gray-500" />
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
                                            <p className="mt-0.5 text-sm text-gray-500">Commented 6 days ago</p>
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
