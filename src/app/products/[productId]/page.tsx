"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from '@/components/product/CartContext';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string[];
  stock: number;
  virtualTryOnFile?: string;
  brand?: { name: string };
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleTryOn = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !product) return;
    setTryOnLoading(true);
    setTryOnResult(null);

    const formData = new FormData();
    formData.append("userImage", e.target.files[0]);
    formData.append("productImage", product.imageUrl[0] || "");

    // Call your backend API to process the try-on (to be implemented)
    const res = await fetch(`/api/tryon`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setTryOnResult(data.resultImageUrl); // The URL of the try-on result
    setTryOnLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-red-600">Product not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl w-full bg-white/80 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        {product.brand && (
          <div className="mb-2 text-lg text-purple-700 font-semibold">{product.brand.name}</div>
        )}
        {product.imageUrl[0] && (
          <img
            src={product.imageUrl[0]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg mb-4"
          />
        )}
        <div className="mb-4 text-gray-700">{product.description}</div>
        <div className="mb-2 font-semibold text-purple-700 text-xl">${product.price.toFixed(2)}</div>
        <div className="mb-4 text-sm text-gray-500">Stock: {product.stock}</div>
        <div className="flex gap-4 mb-6">
          <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Buy Now</Button>
          <Button
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
            onClick={() => addToCart({
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl[0] || '',
              quantity: 1,
            })}
          >
            Add to Cart
          </Button>
          <Button
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold"
            onClick={handleTryOn}
            disabled={tryOnLoading}
          >
            {tryOnLoading ? "Processing..." : "Try On"}
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {tryOnResult && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Virtual Try-On Result</h2>
            <img
              src={tryOnResult}
              alt="Try-On Result"
              className="w-full h-96 object-contain rounded-lg border"
            />
          </div>
        )}
      </div>
    </div>
  );
}