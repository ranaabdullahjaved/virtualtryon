"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/auth");
    }
  }, [session, status, router]);

  // Brand form state
  const [brandName, setBrandName] = useState("");
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandMsg, setBrandMsg] = useState("");
  const [isBrandLoading, setIsBrandLoading] = useState(false);

  // Product form state
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    virtualTryOnFile: "",
  });
  const [productMsg, setProductMsg] = useState("");
  const [isProductLoading, setIsProductLoading] = useState(false);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then(setBrands);
  }, [isBrandLoading]); // Refetch brands when a new one is added

  const handleBrandFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBrandLogoFile(e.target.files[0]);
    }
  };

  const handleProductFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProductImageFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("File upload failed");
    }
    const data = await res.json();
    return data.url;
  };

  const handleAddBrand = async (e: any) => {
    e.preventDefault();
    if (!brandLogoFile) {
      setBrandMsg("Please select a logo file.");
      return;
    }
    setIsBrandLoading(true);
    setBrandMsg("");
    try {
      const logoUrl = await uploadFile(brandLogoFile);
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName, logoUrl }),
      });
      if (res.ok) {
        setBrandMsg("Brand added successfully!");
        setBrandName("");
        setBrandLogoFile(null);
      } else {
        throw new Error("Failed to add brand");
      }
    } catch (error) {
      setBrandMsg("Error adding brand.");
    } finally {
      setIsBrandLoading(false);
    }
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    if (!productImageFile) {
      setProductMsg("Please select a product image.");
      return;
    }
    setIsProductLoading(true);
    setProductMsg("");
    try {
      const imageUrl = await uploadFile(productImageFile);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          price: parseFloat(product.price),
          stock: parseInt(product.stock),
          imageUrl: [imageUrl],
          brandId: selectedBrand,
        }),
      });
      if (res.ok) {
        setProductMsg("Product added successfully!");
        setProduct({ name: "", description: "", price: "", stock: "", virtualTryOnFile: "" });
        setProductImageFile(null);
      } else {
        throw new Error("Failed to add product");
      }
    } catch (error) {
      setProductMsg("Error adding product.");
    } finally {
      setIsProductLoading(false);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
              <Input
                type="file"
                onChange={handleBrandFileChange}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
            <Button type="submit" disabled={isBrandLoading}>
              {isBrandLoading ? "Adding..." : "Add Brand"}
            </Button>
            {brandMsg && <div className={brandMsg.includes("Error") ? "text-red-600" : "text-green-600"}>{brandMsg}</div>}
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
              step="0.01"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <Input
                type="file"
                onChange={handleProductFileChange}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
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
            <Button type="submit" disabled={isProductLoading}>
              {isProductLoading ? "Adding..." : "Add Product"}
            </Button>
            {productMsg && <div className={productMsg.includes("Error") ? "text-red-600" : "text-green-600"}>{productMsg}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
}
