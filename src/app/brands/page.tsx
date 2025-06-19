"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type Brand = {
  id: string;
  name: string;
  logoUrl: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then(setBrands);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Choose a Brand
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="flex flex-col items-center p-6 cursor-pointer hover:scale-105 transition"
            onClick={() => router.push(`/brands/${brand.id}`)}
          >
            <img src={brand.logoUrl} alt={brand.name} className="w-24 h-24 object-contain mb-4 rounded-full shadow" />
            <span className="text-xl font-semibold">{brand.name}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
