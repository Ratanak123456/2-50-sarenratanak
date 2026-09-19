import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between sm:h-16 md:justify-center py-4 px-6 mb-10">
            <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0 md:pl-6">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <Link href="/" aria-label="Home">
                        <img src="https://www.svgrepo.com/show/491978/gas-costs.svg" height="40" width="40" alt="Logo" />
                    </Link>
                    <div className="-mr-2 flex items-center md:hidden">
                        <button type="button" id="main-menu" aria-label="Main menu" aria-haspopup="true" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                            <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="hidden md:flex md:space-x-10">
                <Link href="/"
                    className="font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition duration-150 ease-in-out">Home</Link>
                <Link href="/dashboard"
                    className="font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition duration-150 ease-in-out">Dashboard</Link>
            </div>
            <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0 md:pr-6">
                <span className="inline-flex">
                    <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium text-blue-600 hover:text-blue-500 focus:outline-none transition duration-150 ease-in-out">
                        Login
                    </Link>
                </span>
                <span className="inline-flex rounded-md shadow ml-2">
                    <Link href="/signup" className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 transition duration-150 ease-in-out">
                        Get started
                    </Link>
                </span>
            </div>
        </nav>
    )
}