"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<{ name: string; logoUrl: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/brands/${brandId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setBrand(data.brand);
      });
  }, [brandId]);

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      {brand && (
        <div className="flex flex-col items-center mb-8 mt-24">
          <img src={brand.logoUrl} alt={brand.name} className="w-28 h-28 object-contain mb-2 rounded-full shadow" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{brand.name}</h1>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search products (e.g., suit)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-white/80 shadow-xl border-0 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              {product.imageUrl[0] && (
                <img
                  src={product.imageUrl[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                  style={{ objectPosition: "center" }}
                />
              )}
              <div className="text-gray-700 mb-2 line-clamp-3">{product.description}</div>
              <div className="font-semibold text-purple-700 mb-2">${product.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mb-2">Stock: {product.stock}</div>
              <Button
                className="mt-auto w-full"
                variant="outline"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}