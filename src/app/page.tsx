"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Shirt, ShoppingBag, UserCheck } from "lucide-react";
import styles from "./auth/auth.module.css";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden p-4">
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.blob}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.blob} ${styles.animationDelay2000}`}></div>
        <div className={`absolute top-40 left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 ${styles.blob} ${styles.animationDelay4000}`}></div>
      </div>

      {/* Hero Section */}
      <section className="z-10 w-full max-w-2xl text-center mt-20 mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
          SuitUp
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
          The ultimate virtual try-on and shopping experience. Try on outfits, get styled, and shop with confidence!
        </p>
        {session ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-lg text-gray-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              Welcome, {session.user?.name || session.user?.email}!
            </span>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 animate-bounce"
              onClick={() => router.push("/try-on")}
            >
              Try On Now
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/auth")}
            >
              Login
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-purple-400 text-purple-700 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-purple-50 transition-all duration-300"
              onClick={() => router.push("/auth")}
            >
              Sign Up
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="z-10 w-full max-w-4xl grid md:grid-cols-3 gap-8 mb-20 animate-fade-in">
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
          <CardHeader className="flex flex-col items-center">
            <Shirt className="w-10 h-10 text-purple-500 mb-2 animate-pulse" />
            <CardTitle className="text-xl font-bold">Virtual Try-On</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 text-center">
            Instantly try on clothes from top brands using advanced AI. See how outfits look on you before you buy!
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
          <CardHeader className="flex flex-col items-center">
            <ShoppingBag className="w-10 h-10 text-blue-500 mb-2 animate-pulse" />
            <CardTitle className="text-xl font-bold">Shop with Confidence</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 text-center">
            Browse, favorite, and purchase your favorite looks. Enjoy secure checkout and fast delivery.
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
          <CardHeader className="flex flex-col items-center">
            <UserCheck className="w-10 h-10 text-green-500 mb-2 animate-pulse" />
            <CardTitle className="text-xl font-bold">Personalized Styling</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 text-center">
            Get AI-powered style recommendations and chat with our virtual stylist for the perfect fit every time.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
