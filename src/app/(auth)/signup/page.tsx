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

// Zod schema with 8 characters minimum, a required symbol, and matching confirm password
const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters long' }),
  gender: z.string().min(1, { message: 'Please select a gender' }),
  dob: z.string().min(1, { message: 'Please enter your date of birth' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[!@#$%^&*(),.?":{}|<>\-_=+~`[\]\\;',./]/, { message: 'Password must contain at least one symbol' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormInputs = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log('Register submitted:', data)
    alert('Account created successfully!')
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full min-h-[85vh] px-4 py-12">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to set up your profile
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              
              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs">{errors.fullName.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs">{errors.gender.message}</p>
                )}
              </div>

              {/* Date of Birth (DOB) */}
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  {...register('dob')}
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs">{errors.dob.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
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

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                )}
              </div>

            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground mt-2">
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-4 font-medium text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}