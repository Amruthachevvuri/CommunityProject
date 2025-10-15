import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Upload,
  Search,
  Heart,
  ArrowRight,
  Sparkles,
  Users,
  Leaf,
  TrendingUp,
  Shield,
  MessageCircle
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalUsers: 0,
    itemsDonated: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, users, currentUser] = await Promise.all([
          base44.entities.Item.list(),
          base44.entities.User.list(),
          base44.auth.me().catch(() => null)
        ]);
        setStats({
          totalItems: items.length,
          totalUsers: users.length,
          itemsDonated: items.filter(i => i.status === "completed").length
        });
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: Upload,
      title: "Donate Items",
      description: "Share your unused educational materials with students who need them",
      color: "from-emerald-500 to-teal-500",
      link: createPageUrl("UploadItem")
    },
    {
      icon: Search,
      title: "Find Materials",
      description: "Browse thousands of textbooks, uniforms, and supplies available near you",
      color: "from-blue-500 to-cyan-500",
      link: createPageUrl("BrowseItems")
    },
    {
      icon: MessageCircle,
      title: "Connect Safely",
      description: "Chat securely with donors and receivers within our trusted community",
      color: "from-purple-500 to-pink-500",
      link: createPageUrl("Messages")
    }
  ];

  const benefits = [
    {
      icon: Leaf,
      title: "Save the Planet",
      description: "Reduce educational waste and lower your carbon footprint"
    },
    {
      icon: Heart,
      title: "Help Students",
      description: "Make education more accessible and affordable for everyone"
    },
    {
      icon: Shield,
      title: "Safe & Verified",
      description: "Admin-verified users and listings for your peace of mind"
    },
    {
      icon: TrendingUp,
      title: "Track Impact",
      description: "See the real difference you're making in the community"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-700">A Sustainable Way to Learn</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Reuse. Reduce. Relearn.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Share educational materials with students and parents in your community. 
              From textbooks to uniforms, give items a second life while helping others succeed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to={createPageUrl("UploadItem")}>
                    <Button className="gradient-primary text-white px-8 py-6 text-lg font-medium shadow-xl hover:shadow-2xl smooth-transition">
                      <Upload className="w-5 h-5 mr-2" />
                      Donate Items
                    </Button>
                  </Link>
                  <Link to={createPageUrl("BrowseItems")}>
                    <Button variant="outline" className="px-8 py-6 text-lg font-medium border-2 hover:border-emerald-500 smooth-transition">
                      <Search className="w-5 h-5 mr-2" />
                      Browse Items
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    className="gradient-primary text-white px-8 py-6 text-lg font-medium shadow-xl hover:shadow-2xl smooth-transition"
                    onClick={() => base44.auth.redirectToLogin()}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link to={createPageUrl("BrowseItems")}>
                    <Button variant="outline" className="px-8 py-6 text-lg font-medium border-2 hover:border-emerald-500 smooth-transition">
                      <Search className="w-5 h-5 mr-2" />
                      Browse Items
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white border-none shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalItems}+</p>
                    <p className="text-sm text-gray-600">Items Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}+</p>
                    <p className="text-sm text-gray-600">Community Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.itemsDonated}+</p>
                    <p className="text-sm text-gray-600">Items Donated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start sharing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={user ? feature.link : "#"} onClick={() => !user && base44.auth.redirectToLogin()}>
                <Card className="border-none shadow-lg card-hover cursor-pointer h-full bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center text-emerald-600 font-medium mt-6">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose EduShare?</h2>
            <p className="text-xl text-gray-600">Making education sustainable and accessible</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <benefit.icon className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and parents creating a sustainable future for education
          </p>
          {user ? (
            <Link to={createPageUrl("UploadItem")}>
              <Button className="bg-white text-emerald-600 px-8 py-6 text-lg font-medium hover:bg-gray-100 shadow-xl">
                <Upload className="w-5 h-5 mr-2" />
                Start Donating Today
              </Button>
            </Link>
          ) : (
            <Button 
              className="bg-white text-emerald-600 px-8 py-6 text-lg font-medium hover:bg-gray-100 shadow-xl"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Join EduShare Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}