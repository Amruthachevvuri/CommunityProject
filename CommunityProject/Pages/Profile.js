import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  School,
  BookOpen,
  Edit,
  CheckCircle,
  Award,
  Heart,
  Package
} from "lucide-react";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    institution: "",
    class_grade: "",
    stream: "",
    phone: "",
    location: "",
    bio: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData({
          full_name: currentUser.full_name || "",
          role: currentUser.role || "",
          institution: currentUser.institution || "",
          class_grade: currentUser.class_grade || "",
          stream: currentUser.stream || "",
          phone: currentUser.phone || "",
          location: currentUser.location || "",
          bio: currentUser.bio || ""
        });
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Header */}
        <Card className="border-none shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500">
                <AvatarFallback className="text-white text-3xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.full_name}</h2>
                <p className="text-gray-600 mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
                    {user.role?.replace(/_/g, ' ')}
                  </Badge>
                  {user.verified && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={!isEditing ? "gradient-primary text-white" : ""}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user.items_donated || 0}</p>
                  <p className="text-sm text-gray-600">Items Donated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user.items_received || 0}</p>
                  <p className="text-sm text-gray-600">Items Received</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {((user.items_donated || 0) * 2.5).toFixed(1)} kg
                  </p>
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="donor">Donor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="class_grade">Class/Grade</Label>
                    <Input
                      id="class_grade"
                      value={formData.class_grade}
                      onChange={(e) => setFormData({ ...formData, class_grade: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="stream">Stream</Label>
                    <Input
                      id="stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="gradient-primary text-white w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-900">{user.location}</p>
                      </div>
                    </div>
                  )}

                  {user.institution && (
                    <div className="flex items-center gap-3">
                      <School className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Institution</p>
                        <p className="font-medium text-gray-900">{user.institution}</p>
                      </div>
                    </div>
                  )}

                  {user.class_grade && (
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Class/Grade</p>
                        <p className="font-medium text-gray-900">{user.class_grade}</p>
                      </div>
                    </div>
                  )}

                  {user.stream && (
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Stream</p>
                        <p className="font-medium text-gray-900">{user.stream}</p>
                      </div>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Bio</p>
                    <p className="text-gray-900">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}