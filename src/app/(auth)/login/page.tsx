'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log('Login submitted:', data)
    alert('Logged in successfully!')
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full min-h-[85vh] px-4 py-12">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Login to your account</CardTitle>
          <CardDescription>
            Enter your username and password below to login
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              
              {/* Username Field */}
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="sarenratanak"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-2">
              Don't have an account?{' '}
              <Link href="/signup" className="underline underline-offset-4 font-medium text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}