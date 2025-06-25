"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrl: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Track local stock edits
  const [localStock, setLocalStock] = useState<{ [id: string]: number }>({});
  const [dirtyStock, setDirtyStock] = useState<{ [id: string]: boolean }>({});
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (session && session.user && session.user.role !== "admin") router.push("/");
  }, [status, session, router]);

  const fetchBrands = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      setBrands(await res.json());
    } catch (e) {
      setError("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (brandId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/brands/${brandId}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products);
      // Reset local stock edits
      const stockMap: { [id: string]: number } = {};
      data.products.forEach((p: any) => { stockMap[p.id] = p.stock; });
      setLocalStock(stockMap);
      setDirtyStock({});
    } catch (e) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (session) fetchBrands(); }, [session]);
  useEffect(() => { if (selectedBrand) fetchProducts(selectedBrand); }, [selectedBrand]);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProductImageFile(file);
    if (file) {
      setProductImagePreview(URL.createObjectURL(file));
    } else {
      setProductImagePreview("");
    }
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!productImageFile) {
      setError("Product image is required");
      setLoading(false);
      return;
    }
    let uploadedImageUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", productImageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      console.log("Product image upload response:", uploadData);
      if (!uploadRes.ok || !uploadData.url) throw new Error(uploadData.error || "Failed to upload product image");
      uploadedImageUrl = uploadData.url;
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock) || 0,
          imageUrl: [uploadedImageUrl],
          brandId: selectedBrand,
        }),
      });
      if (!res.ok) throw new Error("Failed to add product");
      setForm({ name: "", description: "", price: "", imageUrl: "", stock: "" });
      setProductImageFile(null);
      setProductImagePreview("");
      setSuccess("Product added!");
      fetchProducts(selectedBrand);
    } catch (e) {
      setError("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setSuccess("Product deleted!");
      fetchProducts(selectedBrand);
    } catch (e) {
      setError("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalStockChange = (id: string, newStock: number) => {
    if (newStock < 0) return;
    setLocalStock(prev => ({ ...prev, [id]: newStock }));
    setDirtyStock(prev => ({ ...prev, [id]: true }));
  };

  const handleUpdateStock = async (id: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: localStock[id] }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      setSuccess("Stock updated!");
      setDirtyStock(prev => ({ ...prev, [id]: false }));
      fetchProducts(selectedBrand);
    } catch (e) {
      setError("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Select Brand</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
        >
          <option value="">-- Select a brand --</option>
          {brands.map((brand: any) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>
      {selectedBrand && (
        <>
          <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 mb-8 items-center">
            <Input
              placeholder="Product Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
            />
            <div className="flex flex-col items-center">
              <label htmlFor="product-image" className="mb-1 font-medium text-sm">Product Image</label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleProductImageChange}
                className="block border border-gray-300 rounded px-3 py-2 w-48 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                required
              />
              {productImagePreview && (
                <img src={productImagePreview} alt="Product Preview" className="w-16 h-16 object-contain rounded border mt-2" />
              )}
            </div>
            <Input
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
            />
            <Button type="submit" disabled={loading}>Add Product</Button>
          </form>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="flex flex-col items-center p-6">
                <img src={product.imageUrl?.[0]} alt={product.name} className="w-20 h-20 object-contain mb-4" />
                <div className="font-bold text-lg mb-2">{product.name}</div>
                <div className="text-gray-500 mb-2">{product.description}</div>
                <div className="mb-2">${product.price}</div>
                <div className="mb-2 flex items-center gap-2">
                  <span>Stock:</span>
                  <Button type="button" size="sm" variant="outline" disabled={loading || localStock[product.id] <= 0} onClick={() => handleLocalStockChange(product.id, localStock[product.id] - 1)}>-</Button>
                  <span className="font-mono w-8 text-center">{localStock[product.id]}</span>
                  <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => handleLocalStockChange(product.id, localStock[product.id] + 1)}>+</Button>
                  <Button type="button" size="sm" variant="default" disabled={loading || !dirtyStock[product.id]} onClick={() => handleUpdateStock(product.id)}>
                    Update Stock
                  </Button>
                </div>
                <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)} disabled={loading}>
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 