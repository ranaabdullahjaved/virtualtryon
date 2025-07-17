"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from '@/components/product/CartContext';
import { motion } from "framer-motion";

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
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const router = useRouter();

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

    const res = await fetch(`/api/tryon`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setTryOnResult(data.resultImageUrl);
    setTryOnLoading(false);
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;
    setBuying(true);
    setBuyError("");
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl[0] || '',
        quantity: 1,
      });
      router.push("/checkout");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setBuyError(e.message || "Failed to buy product");
      } else {
        setBuyError("Failed to buy product");
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-red-600">Product not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.3, scale: 1 }} transition={{ duration: 1 }} className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl z-0" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.2, scale: 1 }} transition={{ duration: 1.2 }} className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl z-0" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.15, scale: 1 }} transition={{ duration: 1.4 }} className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full filter blur-2xl z-0" />
      <motion.div
        className="max-w-4xl w-full bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-10 relative z-10 animate-fade-in"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Image Section */}
        <motion.div className="flex-1 flex flex-col items-center justify-center"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {product.imageUrl[0] && (
            <motion.img
              src={product.imageUrl[0]}
              alt={product.name}
              className="w-80 h-80 object-cover rounded-xl shadow-lg border mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          )}
        </motion.div>
        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <motion.h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {product.name}
          </motion.h1>
          {product.brand && (
            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-2">{product.brand.name}</span>
          )}
          <div className="mb-2 text-xl font-bold text-blue-700">${product.price.toFixed(2)}</div>
          <div className="mb-2 text-gray-700 leading-relaxed text-base">{product.description}</div>
          <div className="mb-2">
            <span className={`font-semibold px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform"
              whileHover={{ scale: 1.07 }}
              onClick={handleBuyNow}
              disabled={buying || product.stock <= 0}
            >
              {buying ? "Processing..." : product.stock > 0 ? "Buy Now" : "Out of Stock"}
            </motion.button>
            <motion.button
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform"
              whileHover={{ scale: 1.07 }}
              onClick={() => addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl[0] || '',
                quantity: 1,
              })}
            >
              Add to Cart
            </motion.button>
          </div>
          {/* Try-On Section */}
          <motion.div
            className="mt-4 p-6 bg-purple-50 rounded-xl border border-purple-200 flex flex-col items-center gap-3 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform animate-pulse"
              whileHover={{ scale: 1.09 }}
              onClick={handleTryOn}
              disabled={tryOnLoading}
            >
              {tryOnLoading ? "Processing..." : "Try On Virtually"}
            </motion.button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {tryOnResult && (
              <motion.div
                className="mt-6 w-full flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold mb-2">Virtual Try-On Result</h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tryOnResult}
                  alt="Try-On Result"
                  className="w-72 h-72 object-contain rounded-lg border shadow-md"
                />
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(tryOnResult, { mode: 'cors' });
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download =
                        product?.name
                          ? `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_tryon.png`
                          : 'tryon_result.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch  {
                      alert('Failed to download image.');
                    }
                  }}
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Download Image
                </button>
              </motion.div>
            )}
          </motion.div>
          {buyError && <div className="text-red-600 font-semibold mt-2">{buyError}</div>}
        </div>
      </motion.div>
    </div>
  );
}