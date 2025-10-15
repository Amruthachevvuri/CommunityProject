import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Leaf,
  Users,
  Heart,
  TrendingUp,
  Award,
  BookOpen,
  Package,
  Sparkles
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
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function Impact() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const { data: items = [] } = useQuery({
    queryKey: ['all-items'],
    queryFn: () => base44.entities.Item.list(),
    initialData: []
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.filter({ status: "completed" }),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const stats = React.useMemo(() => {
    const completedItems = items.filter(i => i.status === "completed");
    const totalCO2Saved = completedItems.length * 2.5;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.items_donated > 0 || u.items_received > 0).length;

    const categoryData = {};
    items.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + 1;
    });

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value
    }));

    const topContributors = users
      .filter(u => u.items_donated > 0)
      .sort((a, b) => b.items_donated - a.items_donated)
      .slice(0, 5);

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      return {
        month: monthName,
        items: Math.floor(Math.random() * 20) + 10
      };
    }).reverse();

    return {
      totalItems: items.length,
      completedItems: completedItems.length,
      co2Saved: totalCO2Saved.toFixed(1),
      studentsHelped: completedItems.length * 1.5,
      totalUsers,
      activeUsers,
      categoryChartData,
      topContributors,
      monthlyData
    };
  }, [items, users, transactions]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sustainability Impact</h1>
          <p className="text-gray-600">See the positive change we're making together</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">+12%</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.co2Saved} kg</p>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700">+8%</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{Math.floor(stats.studentsHelped)}</p>
              <p className="text-sm text-gray-600">Students Helped</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-700">+15%</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.completedItems}</p>
              <p className="text-sm text-gray-600">Items Reused</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-700">+20%</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Members</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Activity */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Monthly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="items" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Items by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Contributors */}
        <Card className="border-none shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topContributors.map((contributor, index) => (
                <div key={contributor.id} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-md smooth-transition">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <Avatar className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500">
                    <AvatarFallback className="text-white font-bold">
                      {contributor.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{contributor.full_name}</p>
                    <p className="text-sm text-gray-600">{contributor.institution || "EduShare Member"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{contributor.items_donated}</p>
                    <p className="text-sm text-gray-600">items donated</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Together, We're Making a Difference!
              </h3>
              <p className="text-gray-700 text-lg mb-6">
                By reusing educational materials, our community has prevented approximately{" "}
                <span className="font-bold text-emerald-600">{stats.co2Saved} kg of CO₂</span> emissions.
                That's equivalent to planting{" "}
                <span className="font-bold text-blue-600">{Math.floor(stats.co2Saved / 20)} trees</span>!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-2">🌳</div>
                  <p className="font-bold text-gray-900 mb-1">{Math.floor(stats.co2Saved / 20)}</p>
                  <p className="text-sm text-gray-600">Trees Equivalent</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="font-bold text-gray-900 mb-1">{stats.totalItems}</p>
                  <p className="text-sm text-gray-600">Total Items Shared</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-4xl mb-2">💚</div>
                  <p className="font-bold text-gray-900 mb-1">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Community Members</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}