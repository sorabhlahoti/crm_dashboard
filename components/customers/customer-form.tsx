"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Customer, supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Form validation schema
const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const isEditing = !!customer
  
  // Initialize form with default values or existing customer data
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      status: customer?.status || "Active",
      notes: customer?.notes || "",
    },
  })
  
  // Handle form submission
  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true)
    
    try {
      if (isEditing) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', customer.id)
        
        if (error) throw error
        
        toast({
          title: "Customer updated",
          description: "Customer information has been updated successfully.",
        })
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([data])
        
        if (error) throw error
        
        toast({
          title: "Customer created",
          description: "New customer has been added successfully.",
        })
        
        // Reset form after successful creation
        form.reset({
          name: "",
          email: "",
          phone: "",
          status: "Active",
          notes: "",
        })
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error saving customer:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Full name of the customer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Primary contact email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormDescription>
                Contact phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current status of the customer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about the customer" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}