import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Shield
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

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

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
    initialData: []
  });

  const { data: items = [] } = useQuery({
    queryKey: ['admin-items'],
    queryFn: () => base44.entities.Item.list(),
    enabled: !!user,
    initialData: []
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list(),
    enabled: !!user,
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list(),
    enabled: !!user,
    initialData: []
  });

  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.verified).length,
    pendingApprovals: items.filter(i => !i.approved).length,
    totalItems: items.length,
    activeItems: items.filter(i => i.status === "available" && i.approved).length,
    pendingReports: reports.filter(r => r.status === "pending").length,
    totalMessages: messages.length,
    flaggedMessages: messages.filter(m => m.flagged).length
  };

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      month: monthName,
      users: Math.floor(Math.random() * 30) + 20,
      items: Math.floor(Math.random() * 50) + 30
    };
  }).reverse();

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage and monitor the EduShare platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xs text-green-600 mt-2">{stats.verifiedUsers} verified</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                {stats.pendingApprovals > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700">{stats.pendingApprovals}</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xs text-emerald-600 mt-2">{stats.activeItems} active</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                {stats.flaggedMessages > 0 && (
                  <Badge className="bg-red-100 text-red-700">{stats.flaggedMessages}</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalMessages}</p>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-xs text-purple-600 mt-2">{stats.flaggedMessages} flagged</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                {stats.pendingReports > 0 && (
                  <Badge className="bg-red-500 text-white">{stats.pendingReports}</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{reports.length}</p>
              <p className="text-sm text-gray-600">Reports</p>
              <p className="text-xs text-red-600 mt-2">{stats.pendingReports} pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to={createPageUrl("AdminUsers")}>
                <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                  {stats.verifiedUsers < stats.totalUsers && (
                    <Badge className="bg-white/20">{stats.totalUsers - stats.verifiedUsers} to verify</Badge>
                  )}
                </Button>
              </Link>

              <Link to={createPageUrl("AdminListings")}>
                <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                  <Package className="w-6 h-6" />
                  <span>Review Listings</span>
                  {stats.pendingApprovals > 0 && (
                    <Badge className="bg-white/20">{stats.pendingApprovals} pending</Badge>
                  )}
                </Button>
              </Link>

              <Link to={createPageUrl("AdminMessages")}>
                <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                  <MessageSquare className="w-6 h-6" />
                  <span>Monitor Messages</span>
                  {stats.flaggedMessages > 0 && (
                    <Badge className="bg-white/20">{stats.flaggedMessages} flagged</Badge>
                  )}
                </Button>
              </Link>

              <Link to={createPageUrl("AdminLoginActivity")}>
                <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <BarChart3 className="w-6 h-6" />
                  <span>Login Activity</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="items" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="New Items"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}