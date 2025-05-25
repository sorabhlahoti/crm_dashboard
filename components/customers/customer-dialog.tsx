"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CustomerForm } from "@/components/customers/customer-form"
import { Customer } from "@/lib/supabase"

interface CustomerDialogProps {
  customer?: Customer
  trigger?: React.ReactNode
  title?: string
  description?: string
  onSuccess?: () => void
}

export function CustomerDialog({
  customer,
  trigger,
  title = customer ? "Edit Customer" : "Add New Customer",
  description = customer 
    ? "Update customer information in your database." 
    : "Add a new customer to your database.",
  onSuccess
}: CustomerDialogProps) {
  const [open, setOpen] = useState(false)
  
  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) {
      onSuccess()
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm 
          customer={customer} 
          onSuccess={handleSuccess} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}