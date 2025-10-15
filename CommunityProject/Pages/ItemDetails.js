import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  MapPin,
  Calendar,
  User,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle,
  Tag
} from "lucide-react";

export default function ItemDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const items = await base44.entities.Item.list();
      return items.find(i => i.id === itemId);
    },
    enabled: !!itemId
  });

  const { data: donor } = useQuery({
    queryKey: ['user', item?.created_by],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.find(u => u.email === item.created_by);
    },
    enabled: !!item
  });

  const updateViewsMutation = useMutation({
    mutationFn: (itemId) => {
      const currentViews = item?.views || 0;
      return base44.entities.Item.update(itemId, { views: currentViews + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    }
  });

  useEffect(() => {
    if (item && itemId) {
      updateViewsMutation.mutate(itemId);
    }
  }, [itemId, item?.id]);

  const handleContactDonor = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return;
    }
    
    const conversationId = [user.email, item.created_by].sort().join('_');
    navigate(`${createPageUrl("Messages")}?conversation=${conversationId}&item=${itemId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Button onClick={() => navigate(createPageUrl("BrowseItems"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const photos = item.photos && item.photos.length > 0 ? item.photos : [null];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("BrowseItems"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photos */}
          <div>
            <Card className="border-none shadow-lg overflow-hidden mb-4">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                {photos[selectedPhoto] ? (
                  <img
                    src={photos[selectedPhoto]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-32 h-32 text-gray-400" />
                )}
              </div>
            </Card>

            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 smooth-transition ${
                      selectedPhoto === index ? "border-emerald-500" : "border-gray-200"
                    }`}
                  >
                    {photo ? (
                      <img src={photo} alt={`${item.name} ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
                      {item.pricing_type === "free" ? "Free" : item.pricing_type === "exchange" ? "Exchange" : `₹${item.price}`}
                    </Badge>
                    <Badge variant="secondary">
                      {item.condition?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="secondary">
                      {item.category?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">{item.description}</p>

              {item.pricing_type === "exchange" && item.exchange_preference && (
                <Card className="bg-blue-50 border-blue-200 mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Looking for:</strong> {item.exchange_preference}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Item Details</h3>
                
                {item.class_grade && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Class/Grade</p>
                      <p className="font-medium text-gray-900">{item.class_grade}</p>
                    </div>
                  </div>
                )}

                {item.subject && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="font-medium text-gray-900">{item.subject}</p>
                    </div>
                  </div>
                )}

                {item.stream && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Stream</p>
                      <p className="font-medium text-gray-900">{item.stream}</p>
                    </div>
                  </div>
                )}

                {item.academic_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Academic Year</p>
                      <p className="font-medium text-gray-900">{item.academic_year}</p>
                    </div>
                  </div>
                )}

                {item.institution && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Institution</p>
                      <p className="font-medium text-gray-900">{item.institution}</p>
                    </div>
                  </div>
                )}

                {item.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{item.location}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {donor && (
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Listed by</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-blue-500">
                      <AvatarFallback className="text-white text-lg font-bold">
                        {donor.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{donor.full_name}</p>
                      <p className="text-sm text-gray-600">{donor.role?.replace(/_/g, ' ')}</p>
                      {donor.verified && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user?.email !== item.created_by && (
              <div className="flex gap-4">
                <Button
                  onClick={handleContactDonor}
                  className="flex-1 gradient-primary text-white h-12 text-lg font-medium shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Donor
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}