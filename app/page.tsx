"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, Loader2, Shield, Sparkles, LayoutDashboard, CheckSquare, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A7C59]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-[#4A7C59]" />
          <span className="text-xl font-bold text-slate-900">
            TaskFlow
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                <User className="w-4 h-4 text-[#4A7C59]" />
                <span className="text-sm text-slate-700">{user?.name || user?.email}</span>
              </div>
              <Link href="/dashboard">
                <Button className="bg-[#4A7C59] hover:bg-[#3d664a] text-white transition-all shadow-sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-[#4A7C59] hover:bg-green-50 transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#4A7C59] hover:bg-[#3d664a] text-white transition-all shadow-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
        {isAuthenticated ? (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#4A7C59] rounded-3xl shadow-xl mb-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900">
              Welcome back, {user?.name || "User"}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Ready to conquer your tasks today? Head to your dashboard to manage your work
              and stay on top of your priorities.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#4A7C59] hover:bg-[#3d664a] text-white px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#4A7C59] rounded-3xl shadow-xl mb-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 max-w-4xl">
              Task Management System
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Organize, prioritize, and track your tasks with our powerful management system.
              Built with enterprise-grade security and a delightful user experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#4A7C59] hover:bg-[#3d664a] text-white px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-6 text-lg rounded-xl transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <CheckSquare className="w-6 h-6 text-[#4A7C59]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Task Management</h3>
                <p className="text-slate-500 text-sm">
                  Create, edit, and organize tasks with priorities and due dates
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Auth</h3>
                <p className="text-slate-500 text-sm">
                  JWT-based authentication with access and refresh tokens
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Updates</h3>
                <p className="text-slate-500 text-sm">
                  Instant status changes and seamless task tracking
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
