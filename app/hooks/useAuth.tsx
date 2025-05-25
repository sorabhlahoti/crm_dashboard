"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize auth state from Supabase session on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setToken(session.access_token)
          
          // Get user profile data
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userError) throw userError
          
          setUser(userData)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token)
          
          // Get user profile data
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (!userError) {
            setUser(userData)
          }
        } else {
          setToken(null)
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session) {
        setToken(data.session.access_token)
        
        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (userError) throw userError
        
        setUser(userData)
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        })
        
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) throw error
      
      // The profile will be created automatically via the database trigger
      
      if (data.session) {
        setToken(data.session.access_token)
        
        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (!userError) {
          setUser(userData)
        }
        
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully!",
        })
        
        router.push('/dashboard')
      } else {
        // If email confirmation is enabled, there won't be a session
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        })
        
        router.push('/login')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setToken(null)
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}