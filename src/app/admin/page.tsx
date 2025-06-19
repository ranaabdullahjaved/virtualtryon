"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session) {
      router.push("/auth");
    } else if (session.user.role !== "admin") {
      router.push("/brands");
    }
  }, [session, status, router]);

  // Brand form state
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandMsg, setBrandMsg] = useState("");

  // Product form state
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    stock: "",
    virtualTryOnFile: "",
  });
  const [productMsg, setProductMsg] = useState("");

  // Fetch brands for product form
  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then(setBrands);
  }, []);

  // Add brand handler
  const handleAddBrand = async (e: any) => {
    e.preventDefault();
    setBrandMsg("");
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: brandName, logoUrl: brandLogo }),
    });
    if (res.ok) {
      setBrandMsg("Brand added!");
      setBrandName("");
      setBrandLogo("");
    } else {
      setBrandMsg("Error adding brand.");
    }
  };

  // Add product handler
  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    setProductMsg("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        imageUrl: product.imageUrl ? [product.imageUrl] : [],
        brandId: selectedBrand,
      }),
    });
    if (res.ok) {
      setProductMsg("Product added!");
      setProduct({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        stock: "",
        virtualTryOnFile: "",
      });
    } else {
      setProductMsg("Error adding product.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Admin Portal
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
        {/* Add Brand */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Brand</h2>
          <form onSubmit={handleAddBrand} className="space-y-4">
            <Input
              placeholder="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
            <Input
              placeholder="Logo URL"
              value={brandLogo}
              onChange={(e) => setBrandLogo(e.target.value)}
              required
            />
            <Button type="submit">Add Brand</Button>
            {brandMsg && <div className="text-green-600">{brandMsg}</div>}
          </form>
        </Card>
        {/* Add Product */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <select
              className="w-full border rounded-lg p-2"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              required
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Product Name"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
            />
            <Input
              placeholder="Price"
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              required
            />
            <Input
              placeholder="Image URL"
              value={product.imageUrl}
              onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
            />
            <Input
              placeholder="Stock"
              type="number"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              required
            />
            <Input
              placeholder="Virtual Try-On File URL"
              value={product.virtualTryOnFile}
              onChange={(e) => setProduct({ ...product, virtualTryOnFile: e.target.value })}
            />
            <Button type="submit">Add Product</Button>
            {productMsg && <div className="text-green-600">{productMsg}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
}