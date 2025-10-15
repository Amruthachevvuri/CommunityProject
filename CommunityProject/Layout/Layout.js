import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  BookOpen,
  Home,
  Upload,
  MessageSquare,
  User,
  Heart,
  LayoutDashboard,
  Menu,
  X,
  Search,
  ShoppingBag,
  LogOut,
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user) return;
      try {
        const messages = await base44.entities.Message.filter({
          receiver_email: user.email,
          read: false
        });
        setUnreadCount(messages.length);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };
    
    if (user) {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const publicNavItems = [
    { title: "Home", url: createPageUrl("Home"), icon: Home },
    { title: "Browse Items", url: createPageUrl("BrowseItems"), icon: Search },
  ];

  const userNavItems = [
    { title: "My Items", url: createPageUrl("MyItems"), icon: ShoppingBag },
    { title: "Upload Item", url: createPageUrl("UploadItem"), icon: Upload },
    { title: "Messages", url: createPageUrl("Messages"), icon: MessageSquare, badge: unreadCount },
    { title: "Impact", url: createPageUrl("Impact"), icon: Heart },
    { title: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  const adminNavItems = [
    { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
  ];

  const isAdmin = user?.role === "admin";
  const navItems = user
    ? [...publicNavItems, ...userNavItems, ...(isAdmin ? adminNavItems : [])]
    : publicNavItems;

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-green: #10B981;
          --primary-green-dark: #059669;
          --primary-blue: #3B82F6;
          --primary-blue-dark: #2563EB;
          --accent-emerald: #34D399;
          --accent-sky: #60A5FA;
          --bg-soft: #F9FAFB;
          --text-primary: #111827;
          --text-secondary: #6B7280;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--bg-soft);
        }
        
        .gradient-primary {
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-emerald) 100%);
        }
        
        .gradient-secondary {
          background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-sky) 100%);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        
        .smooth-transition {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg smooth-transition group-hover:scale-105">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gradient">EduShare</h2>
                <p className="text-xs text-gray-500 font-medium">Reuse. Reduce. Relearn.</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`smooth-transition hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 rounded-xl ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                          {item.badge > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white">{item.badge}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <div className="mt-auto pt-4 px-4 border-t border-gray-100">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  {user.verified && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Verified
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-gray-700 hover:text-red-600 hover:border-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}

            {!user && (
              <div className="mt-auto pt-4 px-4 border-t border-gray-100">
                <Button
                  className="w-full gradient-primary text-white font-medium shadow-lg hover:shadow-xl smooth-transition"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In / Register
                </Button>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-100 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg smooth-transition" />
              <h1 className="text-xl font-bold text-gradient">EduShare</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}