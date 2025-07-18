
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Leaf, Truck, Award, Star } from "lucide-react";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-farm-white-soft">
      <Navigation />
      <Hero />
      <Features />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
