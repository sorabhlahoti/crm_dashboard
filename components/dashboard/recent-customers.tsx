import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentCustomers = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    date: "Oct 24, 2023",
    avatar: "/avatar-1.png"
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$1,499.00",
    date: "Oct 23, 2023",
    avatar: "/avatar-2.png"
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$2,179.00",
    date: "Oct 22, 2023",
    avatar: "/avatar-3.png"
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$899.00",
    date: "Oct 22, 2023",
    avatar: "/avatar-4.png"
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$1,599.00",
    date: "Oct 21, 2023",
    avatar: "/avatar-5.png"
  }
]

export function RecentCustomers() {
  return (
    <div className="space-y-8">
      {recentCustomers.map((customer, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={customer.avatar} alt={customer.name} />
            <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          <div className="ml-auto font-medium">{customer.amount}</div>
        </div>
      ))}
    </div>
  )
}