import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  Notebook,
  Shirt,
  Beaker,
  Backpack,
  Pencil,
  Package,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";

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

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pricingFilter, setPricingFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['browse-items'],
    queryFn: () => base44.entities.Item.filter({ approved: true, status: "available" }, "-created_date"),
    initialData: []
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesPricing = pricingFilter === "all" || item.pricing_type === pricingFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    const matchesClass = classFilter === "all" || item.class_grade === classFilter;

    return matchesSearch && matchesCategory && matchesPricing && matchesCondition && matchesClass;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Items</h1>
          <p className="text-gray-600">Discover educational materials shared by your community</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, subject, or institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="textbook">Textbooks</SelectItem>
                    <SelectItem value="notebook">Notebooks</SelectItem>
                    <SelectItem value="uniform">Uniforms</SelectItem>
                    <SelectItem value="lab_record">Lab Records</SelectItem>
                    <SelectItem value="bag">Bags</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={pricingFilter} onValueChange={setPricingFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="sell">For Sale</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="acceptable">Acceptable</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Class/Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
                    <SelectItem value="4">Class 4</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredItems.length}</span> items found
          </p>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
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
        ) : filteredItems.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const Icon = categoryIcons[item.category] || Package;
              const gradientColor = categoryColors[item.category] || categoryColors.other;
              
              return (
                <Link key={item.id} to={`${createPageUrl("ItemDetails")}?id=${item.id}`}>
                  <Card className="overflow-hidden border-none shadow-lg card-hover h-full">
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
                        <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">
                          {item.pricing_type === "free" ? "Free" : item.pricing_type === "exchange" ? "Exchange" : `₹${item.price}`}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.condition?.replace(/_/g, ' ')}
                        </Badge>
                        {item.class_grade && (
                          <Badge variant="secondary" className="text-xs">
                            Class {item.class_grade}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                        {item.institution && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{item.institution}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views || 0} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_date).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}