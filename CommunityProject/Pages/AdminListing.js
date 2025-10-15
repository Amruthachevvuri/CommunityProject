
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Shield, Eye } from "lucide-react";

export default function AdminListings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

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

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-items'],
    queryFn: () => base44.entities.Item.list("-created_date"),
    enabled: !!user,
    initialData: []
  });

  const approveItemMutation = useMutation({
    mutationFn: ({ itemId, approved }) => 
      base44.entities.Item.update(itemId, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.created_by?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "pending" && !item.approved) ||
      (filterStatus === "approved" && item.approved);

    return matchesSearch && matchesStatus;
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">Listing Management</h1>
          </div>
          <p className="text-gray-600">Review and approve item listings</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending ({items.filter(i => !i.approved).length})
                </Button>
                <Button
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  onClick={() => setFilterStatus("approved")}
                >
                  Approved ({items.filter(i => i.approved).length})
                </Button>
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                >
                  All ({items.length})
                </Button>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search listings..."
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
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Listed By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.category?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.condition?.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
                          {item.pricing_type === "free" ? "Free" : 
                           item.pricing_type === "exchange" ? "Exchange" : 
                           `₹${item.price}`}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.created_by}</TableCell>
                      <TableCell>
                        {item.approved ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.approved ? "outline" : "default"}
                            onClick={() => approveItemMutation.mutate({ 
                              itemId: item.id, 
                              approved: !item.approved 
                            })}
                            className={!item.approved ? "gradient-primary text-white" : ""}
                          >
                            {item.approved ? "Unapprove" : "Approve"}
                          </Button>
                        </div>
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
