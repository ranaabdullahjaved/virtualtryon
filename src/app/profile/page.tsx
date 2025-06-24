"use client";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold text-center mb-8">Profile</h1>
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-center mb-6">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-purple-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-16 h-16 text-purple-500" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{session?.user?.name || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{session?.user?.email || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 