
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Shield } from "lucide-react";

export default function AdminUsers() {
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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list("-created_date"),
    enabled: !!user,
    initialData: []
  });

  const verifyUserMutation = useMutation({
    mutationFn: ({ userId, verified }) => 
      base44.entities.User.update(userId, { verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const filteredUsers = users.filter(u => 
    !searchQuery || 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.institution?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Verify and manage platform users</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users..."
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
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500">
                            <AvatarFallback className="text-white font-bold">
                              {u.full_name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{u.full_name}</p>
                            <p className="text-sm text-gray-600">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {u.role?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.institution || "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-900">Donated: {u.items_donated || 0}</p>
                          <p className="text-gray-600">Received: {u.items_received || 0}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.verified ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={u.verified ? "outline" : "default"}
                          onClick={() => verifyUserMutation.mutate({ 
                            userId: u.id, 
                            verified: !u.verified 
                          })}
                          className={!u.verified ? "gradient-primary text-white" : ""}
                        >
                          {u.verified ? "Unverify" : "Verify"}
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
