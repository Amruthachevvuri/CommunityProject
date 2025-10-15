import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Notebook,
  Shirt,
  Beaker,
  Backpack,
  Pencil,
  Package,
  Plus,
  Eye,
  Calendar,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categoryIcons = {
  textbook: BookOpen,
  notebook: Notebook,
  uniform: Shirt,
  lab_record: Beaker,
  bag: Backpack,
  stationery: Pencil,
  equipment: Package,
  other: Package
};

const categoryColors = {
  textbook: "from-blue-500 to-indigo-500",
  notebook: "from-purple-500 to-pink-500",
  uniform: "from-emerald-500 to-teal-500",
  lab_record: "from-orange-500 to-red-500",
  bag: "from-cyan-500 to-blue-500",
  stationery: "from-yellow-500 to-orange-500",
  equipment: "from-gray-500 to-slate-500",
  other: "from-gray-400 to-gray-600"
};

export default function MyItems() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("MyItems"));
      }
    };
    fetchUser();
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['my-items', user?.email],
    queryFn: () => base44.entities.Item.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.Item.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-items'] });
      setDeleteItemId(null);
    }
  });

  const getStatusIcon = (status, approved) => {
    if (!approved) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === "available") return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-blue-600" />;
    return <XCircle className="w-4 h-4 text-gray-600" />;
  };

  const getStatusText = (status, approved) => {
    if (!approved) return "Pending Approval";
    if (status === "available") return "Available";
    if (status === "pending") return "Pending Transaction";
    if (status === "completed") return "Donated";
    return "Removed";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-64 w-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Items</h1>
            <p className="text-gray-600">Manage your donated and listed items</p>
          </div>
          <Link to={createPageUrl("UploadItem")}>
            <Button className="gradient-primary text-white shadow-lg hover:shadow-xl smooth-transition">
              <Plus className="w-5 h-5 mr-2" />
              Add New Item
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {items.filter(i => i.status === "available" && i.approved).length}
                  </p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {items.filter(i => !i.approved).length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {items.filter(i => i.status === "completed").length}
                  </p>
                  <p className="text-sm text-gray-600">Donated</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-600 mb-6">Start sharing by uploading your first item</p>
              <Link to={createPageUrl("UploadItem")}>
                <Button className="gradient-primary text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Your First Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const Icon = categoryIcons[item.category] || Package;
              const gradientColor = categoryColors[item.category] || categoryColors.other;
              
              return (
                <Card key={item.id} className="overflow-hidden border-none shadow-lg card-hover">
                  <div className={`h-48 bg-gradient-to-br ${gradientColor} flex items-center justify-center relative`}>
                    {item.photos && item.photos.length > 0 ? (
                      <img 
                        src={item.photos[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-20 h-20 text-white opacity-80" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm flex items-center gap-1">
                        {getStatusIcon(item.status, item.approved)}
                        {getStatusText(item.status, item.approved)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs">
                        {item.pricing_type === "free" ? "Free" : item.pricing_type === "exchange" ? "Exchange" : `₹${item.price}`}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.condition?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      {item.views || 0} views
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemMutation.mutate(deleteItemId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}