import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadItem() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    condition: "",
    class_grade: "",
    stream: "",
    subject: "",
    academic_year: "",
    institution: "",
    pricing_type: "",
    price: 0,
    exchange_preference: "",
    location: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          location: currentUser.location || "",
          institution: currentUser.institution || "",
          class_grade: currentUser.class_grade || "",
          stream: currentUser.stream || ""
        }));
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("UploadItem"));
      }
    };
    fetchUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingPhotos(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const urls = await Promise.all(uploadPromises);
      setPhotos([...photos, ...urls]);
    } catch (error) {
      console.error("Error uploading photos:", error);
    }
    setUploadingPhotos(false);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const generateAiDescription = async () => {
    if (!formData.name || !formData.category) {
      return;
    }

    setAiSuggesting(true);
    try {
      const prompt = `Generate a brief, appealing description for a ${formData.category} named "${formData.name}" that someone is donating/selling on an educational materials sharing platform. 
      Keep it under 100 words, highlight its value for students, and be encouraging. 
      ${formData.condition ? `The condition is ${formData.condition}.` : ''}
      ${formData.subject ? `It's for ${formData.subject} subject.` : ''}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setFormData(prev => ({
        ...prev,
        description: response
      }));
    } catch (error) {
      console.error("Error generating AI description:", error);
    }
    setAiSuggesting(false);
  };

  const createItemMutation = useMutation({
    mutationFn: (itemData) => base44.entities.Item.create(itemData),
    onSuccess: () => {
      navigate(createPageUrl("MyItems"));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const itemData = {
      ...formData,
      photos,
      price: formData.pricing_type === "sell" ? Number(formData.price) : 0,
      status: "available",
      approved: false
    };

    createItemMutation.mutate(itemData);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Item</h1>
          <p className="text-gray-600">Share your educational materials with the community</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Photo Upload */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photos (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 smooth-transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 smooth-transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploadingPhotos}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {uploadingPhotos ? (
                      <Loader2 className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-600 font-medium">
                      {uploadingPhotos ? "Uploading..." : "Click to upload photos"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mathematics Textbook Class 10"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="notebook">Notebook</SelectItem>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="lab_record">Lab Record</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="stationery">Stationery</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="description">Description *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAiDescription}
                      disabled={aiSuggesting || !formData.name || !formData.category}
                      className="text-xs"
                    >
                      {aiSuggesting ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the item, its condition, and why it would be useful..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="acceptable">Acceptable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Academic Details */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class_grade">Class/Grade</Label>
                    <Input
                      id="class_grade"
                      value={formData.class_grade}
                      onChange={(e) => setFormData({ ...formData, class_grade: e.target.value })}
                      placeholder="e.g., 10, 11, Engineering 1st Year"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stream">Stream</Label>
                    <Input
                      id="stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      placeholder="e.g., Science, Commerce, Arts"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Physics"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Input
                      id="academic_year"
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      placeholder="e.g., 2023-24"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="institution">Institution Name</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="School or College name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City or area"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Pricing Options *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How would you like to share this item?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pricing_type: "free" })}
                      className={`p-4 border-2 rounded-lg smooth-transition ${
                        formData.pricing_type === "free"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎁</div>
                        <p className="font-semibold">Free Donation</p>
                        <p className="text-sm text-gray-600 mt-1">Give it away free</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pricing_type: "exchange" })}
                      className={`p-4 border-2 rounded-lg smooth-transition ${
                        formData.pricing_type === "exchange"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <p className="font-semibold">Exchange</p>
                        <p className="text-sm text-gray-600 mt-1">Swap for something</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pricing_type: "sell" })}
                      className={`p-4 border-2 rounded-lg smooth-transition ${
                        formData.pricing_type === "sell"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <p className="font-semibold">Sell</p>
                        <p className="text-sm text-gray-600 mt-1">At a low cost</p>
                      </div>
                    </button>
                  </div>
                </div>

                {formData.pricing_type === "sell" && (
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price in rupees"
                      required
                      className="mt-1"
                    />
                  </div>
                )}

                {formData.pricing_type === "exchange" && (
                  <div>
                    <Label htmlFor="exchange_preference">What would you like in exchange?</Label>
                    <Input
                      id="exchange_preference"
                      value={formData.exchange_preference}
                      onChange={(e) => setFormData({ ...formData, exchange_preference: e.target.value })}
                      placeholder="e.g., Physics textbook, Calculator, etc."
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>Note:</strong> Your item will be reviewed by our admin team before being published. 
                This helps maintain quality and safety in our community.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl("MyItems"))}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || createItemMutation.isPending}
                className="flex-1 gradient-primary text-white"
              >
                {uploading || createItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Upload Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}