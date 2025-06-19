"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string[];
  stock: number;
  virtualTryOnFile?: string;
};

export default function BrandProductsPage() {
  const { brandId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<{ name: string; logoUrl: string } | null>(null);

  useEffect(() => {
    fetch(`/api/brands/${brandId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setBrand(data.brand);
      });
  }, [brandId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      {brand && (
        <div className="flex flex-col items-center mb-8">
          <img src={brand.logoUrl} alt={brand.name} className="w-28 h-28 object-contain mb-2 rounded-full shadow" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{brand.name}</h1>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="bg-white/80 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {product.imageUrl[0] && (
                <img
                  src={product.imageUrl[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="text-gray-700 mb-2">{product.description}</div>
              <div className="font-semibold text-purple-700 mb-2">${product.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mb-2">Stock: {product.stock}</div>
              {/* Placeholder for virtual try-on button */}
              {product.virtualTryOnFile && (
                <button className="mt-2 w-full bg-purple-500 text-white py-2 rounded-lg">Try On Virtually</button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}