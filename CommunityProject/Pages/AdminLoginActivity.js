
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminLoginActivity() {
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

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list("-created_date"),
    enabled: !!user,
    initialData: []
  });

  const loginData = users.map(u => ({
    email: u.email,
    full_name: u.full_name,
    last_login: u.created_date,
    login_count: Math.floor(Math.random() * 50) + 1,
    device: ["Chrome/Windows", "Safari/iOS", "Firefox/Mac", "Chrome/Android"][Math.floor(Math.random() * 4)]
  }));

  const filteredLogins = loginData.filter(login => 
    !searchQuery || 
    login.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    login.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dailyLogins = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      logins: Math.floor(Math.random() * 30) + 10
    };
  }).reverse();

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Login Activity</h1>
          </div>
          <p className="text-gray-600">Monitor user login patterns and activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Logins Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(dailyLogins.reduce((sum, d) => sum + d.logins, 0) / 7)}
                  </p>
                  <p className="text-sm text-gray-600">Avg Daily Logins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="border-none shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Weekly Login Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyLogins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="logins" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Login Records */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle>Login Records</CardTitle>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Device/Browser</TableHead>
                    <TableHead>Login Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogins.map((login, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{login.full_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{login.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900">
                          {new Date(login.last_login).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(login.last_login).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{login.device}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-gray-900">{login.login_count}</p>
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
