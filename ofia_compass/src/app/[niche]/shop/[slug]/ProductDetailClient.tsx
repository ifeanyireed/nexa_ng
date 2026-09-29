"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Info
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";

export default function ProductDetailClient({ data }: { data: any }) {
  const params = useParams();
  const router = useRouter();
  const nicheSlug = params.niche as string;
  const productSlug = params.slug as string;
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const productId = productSlug.includes("product-") 
    ? productSlug.split("product-")[1] 
    : productSlug;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await api.get(`/discovery/products/${productId}`);
        setProduct(result);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24">
        <NexaNavbar />
        <div className="container mx-auto px-4 animate-pulse space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-nexa-bg-surface rounded-[40px]" />
              <div className="space-y-8">
                 <div className="h-12 bg-nexa-bg-surface rounded-2xl w-3/4" />
                 <div className="h-24 bg-nexa-bg-surface rounded-2xl" />
                 <div className="h-16 bg-nexa-bg-surface rounded-2xl w-1/2" />
              </div>
           </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-nexa-bg-base min-h-screen flex items-center justify-center pt-32 pb-24">
        <NexaNavbar />
        <div className="text-center space-y-6">
           <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
              <Info className="w-10 h-10" />
           </div>
           <h3 className="text-2xl font-bold">Product Not Found</h3>
           <NexaButton variant="secondary" onClick={() => window.history.back()}>Go Back</NexaButton>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <Link href={`/${nicheSlug}/shop`} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* PRODUCT IMAGES */}
          <div className="space-y-6">
             <div className="aspect-square bg-slate-200 rounded-[40px] overflow-hidden shadow-2xl relative">
                <img 
                   src={product.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600"} 
                   className="w-full h-full object-cover" 
                   alt={product.name}
                />
                <div className="absolute top-4 right-4 z-10">
                   <button onClick={(e) => toggleFavorite(product.id, e)} className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-nexa-text-secondary shadow-lg hover:text-rose-500 transition-colors">
                      <Heart className={cn("w-6 h-6 transition-colors", isFavorite(product.id) ? "fill-rose-500 text-rose-500" : "")} />
                   </button>
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square rounded-2xl bg-slate-200 cursor-pointer transition-all border-2",
                      activeImage === i ? "border-nexa-brand scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                     <img 
                        src={product.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"} 
                        className="w-full h-full object-cover rounded-[14px]" 
                        alt={product.name}
                     />
                  </div>
                ))}
             </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col">
             <div className="mb-8">
                <NexaBadge variant="brand" className="mb-4">Verified Supply</NexaBadge>
                <h1 className="text-3xl md:text-5xl font-extrabold text-display mb-4 leading-[1.1]">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                      <span className="text-sm font-bold ml-2">4.9</span>
                      <span className="text-sm text-nexa-text-faint ml-1">({Math.floor(Math.random() * 200) + 50} Reviews)</span>
                   </div>
                   <div className="w-px h-4 bg-nexa-border" />
                   <span className="text-sm text-emerald-500 font-bold">In Stock</span>
                </div>
             </div>

             <div className="mb-10">
                <div className="flex items-baseline gap-4 mb-2">
                   <span className="text-4xl font-extrabold text-nexa-brand">₦{product.price.toLocaleString()}</span>
                   <span className="text-xl text-nexa-text-faint line-through">₦{(product.price * 1.25).toLocaleString()}</span>
                   <NexaBadge variant="neutral" className="bg-coral/10 text-coral border-coral/20">-25% OFF</NexaBadge>
                </div>
                <p className="text-sm text-nexa-text-faint">Incl. all taxes and shipping in Lagos</p>
             </div>

             <div className="space-y-6 mb-10 pb-10 border-b border-nexa-border">
                <p className="text-nexa-text-secondary leading-relaxed">
                   {product.description || `Premium ${product.name} designed for professional use in the ${data.name.toLowerCase()} industry. High durability and verified quality by Nexa.`}
                </p>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center bg-nexa-bg-surface border border-nexa-border rounded-xl p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                      >
                         <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                      >
                         <Plus className="w-4 h-4" />
                      </button>
                   </div>
                   <NexaButton 
                     size="xl" 
                     className="flex-1 shadow-2xl" 
                     leftIcon={<ShoppingBag className="w-5 h-5" />}
                     onClick={() => {
                        localStorage.setItem("nexa_cart", JSON.stringify([{
                           id: data.id,
                           name: data.name,
                           price: data.price,
                           image: data.image,
                           qty: 1
                        }]));
                        router.push("/checkout/shipping");
                     }}
                   >
                      Buy Now
                   </NexaButton>
                </div>
             </div>

             {/* SELLER CARD */}
             {product.proProfile && (
                <NexaCard variant="glass" className="mb-10 flex items-center justify-between p-4 bg-nexa-bg-surface/50">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-nexa-brand/10 flex items-center justify-center text-xl font-bold">
                        {product.proProfile.user?.name.charAt(0)}
                      </div>
                      <div>
                         <div className="flex items-center gap-1 mb-1">
                            <h4 className="font-bold text-sm">{product.proProfile.user?.name}</h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-nexa-brand" />
                         </div>
                         <div className="flex items-center gap-2 text-[10px] text-nexa-text-faint font-bold uppercase">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{product.proProfile.rating || "5.0"} Rating • Professional Seller</span>
                         </div>
                      </div>
                   </div>
                   <Link href={getProLink(product.proProfile) + "/shop"}>
                      <NexaButton variant="secondary" size="sm">View Shop</NexaButton>
                   </Link>
                </NexaCard>
             )}

             {/* SHIPPING INFO */}
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-nexa-bg-base">
                   <Truck className="w-5 h-5 text-nexa-brand mt-1" />
                   <div>
                      <h5 className="font-bold text-xs mb-1">Fast Delivery</h5>
                      <p className="text-[10px] text-nexa-text-secondary">Arrives in 2-3 business days within Lagos.</p>
                   </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-nexa-bg-base">
                   <RotateCcw className="w-5 h-5 text-emerald-500 mt-1" />
                   <div>
                      <h5 className="font-bold text-xs mb-1">Easy Returns</h5>
                      <p className="text-[10px] text-nexa-text-secondary">7-day free return policy for all verified items.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
