
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, Flag, CheckCircle } from "lucide-react";

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== "admin") {
          window.location.href = createPageUrl("Home");
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list("-created_date"),
    enabled: !!user,
    refetchInterval: 10000,
    initialData: []
  });

  const flagMessageMutation = useMutation({
    mutationFn: ({ messageId, flagged }) => 
      base44.entities.Message.update(messageId, { flagged }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    }
  });

  const filteredMessages = messages.filter(msg => 
    !searchQuery || 
    msg.sender_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.receiver_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Message Moderation</h1>
          </div>
          <p className="text-gray-600">Monitor and moderate platform messages</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle>
                All Messages ({filteredMessages.length})
                {messages.filter(m => m.flagged).length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {messages.filter(m => m.flagged).length} flagged
                  </Badge>
                )}
              </CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((msg) => (
                    <TableRow key={msg.id} className={msg.flagged ? "bg-red-50" : ""}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{msg.sender_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{msg.receiver_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-md">{msg.message}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_date).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        {msg.flagged ? (
                          <Badge className="bg-red-100 text-red-700">
                            <Flag className="w-3 h-3 mr-1" />
                            Flagged
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={msg.flagged ? "outline" : "destructive"}
                          onClick={() => flagMessageMutation.mutate({ 
                            messageId: msg.id, 
                            flagged: !msg.flagged 
                          })}
                        >
                          {msg.flagged ? "Unflag" : "Flag"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
