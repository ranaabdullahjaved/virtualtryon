"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AdminBrandsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => { if (session) fetchBrands(); }, [session]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview("");
    }
  };

  const handleAddBrand = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    let uploadedLogoUrl = logoUrl;
    try {
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload logo");
        uploadedLogoUrl = uploadData.url;
      }
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl: uploadedLogoUrl }),
      });
      if (!res.ok) throw new Error("Failed to add brand");
      setName("");
      setLogoFile(null);
      setLogoPreview("");
      setLogoUrl("");
      setSuccess("Brand added!");
      fetchBrands();
    } catch (e) {
      setError("Failed to add brand");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this brand? This action cannot be undone.")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      setSuccess("Brand deleted!");
      fetchBrands();
    } catch (e) {
      setError("Failed to delete brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-8">Brand Management</h1>
      <form onSubmit={handleAddBrand} className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <Input
          placeholder="Brand Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <div className="flex flex-col items-center">
          <label htmlFor="brand-logo" className="mb-1 font-medium text-sm">Brand Logo</label>
          <input
            id="brand-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block border border-gray-300 rounded px-3 py-2 w-48 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            required
          />
          {logoPreview && (
            <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded border mt-2" />
          )}
        </div>
        <Button type="submit" disabled={loading}>Add Brand</Button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brands.map((brand: any) => (
          <Card key={brand.id} className="flex flex-col items-center p-6">
            <img src={brand.logoUrl} alt={brand.name} className="w-20 h-20 object-contain mb-4" />
            <div className="font-bold text-lg mb-2">{brand.name}</div>
            <Button variant="destructive" onClick={() => handleDeleteBrand(brand.id)} disabled={loading}>
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
} 