# cryptochat
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Send, Droplets, CreditCard, Camera, LogIn } from 'lucide-react'

type Message = {
  id: number
  user: string
  content: string
  timestamp: string
  avatar: string
}

type User = {
  name: string
  avatar: string
  balance: {
    BTC: number
    ETH: number
  }
  isLoggedIn: boolean
}

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      user: 'Alice', 
      content: 'Hey everyone!', 
      timestamp: '10:00 AM',
      avatar: '/placeholder.svg?height=32&width=32'
    },
    { 
      id: 2, 
      user: 'Bob', 
      content: 'Hi Alice!', 
      timestamp: '10:01 AM',
      avatar: '/placeholder.svg?height=32&width=32'
    },
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<User>({
    name: 'Guest',
    avatar: '/placeholder.svg?height=32&width=32',
    balance: { BTC: 0.01, ETH: 0.5 },
    isLoggedIn: false
  })
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' })

  const handleLogin = () => {
    if (loginCredentials.username && loginCredentials.password) {
      setCurrentUser(prev => ({
        ...prev,
        name: loginCredentials.username,
        isLoggedIn: true
      }))
      setLoginDialogOpen(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentUser(prev => ({
          ...prev,
          avatar: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const deposit = (amount: number, currency: 'BTC' | 'ETH') => {
    if (currentUser.isLoggedIn) {
      setCurrentUser(prev => ({
        ...prev,
        balance: {
          ...prev.balance,
          [currency]: prev.balance[currency] + amount
        }
      }))
    }
  }

  const rain = (amount: number, currency: 'BTC' | 'ETH') => {
    if (currentUser.isLoggedIn && currentUser.balance[currency] >= amount) {
      setCurrentUser(prev => ({
        ...prev,
        balance: {
          ...prev.balance,
          [currency]: prev.balance[currency] - amount
        }
      }))
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'System',
        content: `${currentUser.name} made it rain ${amount} ${currency}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '/placeholder.svg?height=32&width=32'
      }])
    }
  }

  const sendMessage = () => {
    if (currentMessage.trim() && currentUser.isLoggedIn) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: currentUser.name,
        content: currentMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.avatar
      }])
      setCurrentMessage('')
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Crypto Chat</CardTitle>
        {currentUser.isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer"
              >
                <Camera className="h-3 w-3 text-primary-foreground" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            <span className="font-medium">{currentUser.name}</span>
          </div>
        ) : (
          <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>Enter your credentials to continue</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={loginCredentials.username}
                    onChange={(e) => setLoginCredentials(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>Login</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_200px] gap-4">
          <div className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {messages.map(message => (
                <div key={message.id} className="mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.avatar} alt={message.user} />
                      <AvatarFallback>{message.user[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{message.user}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="mt-1 text-sm">{message.content}</p>
                </div>
              ))}
            </ScrollArea>
            <div className="flex space-x-2">
              <Input
                placeholder={currentUser.isLoggedIn ? "Type your message..." : "Please login to chat"}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!currentUser.isLoggedIn}
              />
              <Button onClick={sendMessage} disabled={!currentUser.isLoggedIn}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>BTC: {currentUser.balance.BTC}</p>
                <p>ETH: {currentUser.balance.ETH}</p>
              </CardContent>
            </Card>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={!currentUser.isLoggedIn}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>Choose a method to deposit funds.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="crypto">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="credit">Credit Card</TabsTrigger>
                  </TabsList>
                  <TabsContent value="crypto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="Enter amount" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select id="currency" className="w-full p-2 rounded-md border">
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                        </select>
                      </div>
                      <Button className="w-full" onClick={() => deposit(0.001, 'BTC')}>
                        Deposit
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="credit">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card">Card Number</Label>
                        <Input id="card" type="text" placeholder="Enter card number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="Enter amount" />
                      </div>
                      <Button className="w-full" onClick={() => deposit(0.01, 'ETH')}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" disabled={!currentUser.isLoggedIn}>
                  <Droplets className="h-4 w-4 mr-2" />
                  Rain
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => rain(0.0005, 'BTC')}>
                  Rain 0.0005 BTC
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => rain(0.005, 'ETH')}>
                  Rain 0.005 ETH
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
