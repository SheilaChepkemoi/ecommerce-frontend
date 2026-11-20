import Button from '@/components/shared/Button'
import React from 'react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-8">Login</h1>
        <form className="bg-white p-8 rounded shadow-md w-full max-w-sm">
            <div className="mb-4"> 
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Email
                </label>    
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="username"
                    type="text"
                    placeholder="Enter your email"
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password 
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                />
            </div>
            <div className="flex items-center justify-between">
                <Button
                    className=""
                    type="submit"
                >
                    Login
                </Button>
            </div>
        </form>
    </div>
  )
}
