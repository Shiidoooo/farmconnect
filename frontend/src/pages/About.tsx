
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Award, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-farm-white-soft">
      <Navigation />
      
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              About <span className="text-farm-green-600">HarvestConnect</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're connecting urban communities with fresh, locally-grown produce while empowering home gardeners to share their harvest and passion for sustainable living.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Leaf className="w-8 h-8 text-farm-green-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To create a sustainable ecosystem where local gardeners can share their fresh produce with their community, 
                  reducing food waste and promoting healthy, organic eating habits while building stronger neighborhood connections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Heart className="w-8 h-8 text-farm-red-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Our Vision</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  A world where every neighborhood has access to fresh, affordable produce grown with love by their neighbors, 
                  creating communities that are healthier, more sustainable, and more connected.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-farm-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-farm-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sustainability</h3>
                <p className="text-gray-600">
                  We believe in growing and sharing food in ways that protect our environment for future generations.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Community</h3>
                <p className="text-gray-600">
                  Strong communities are built through sharing, caring, and supporting each other's growth.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Quality</h3>
                <p className="text-gray-600">
                  We're committed to the highest standards of freshness, taste, and nutritional value in every harvest.
                </p>
              </div>
            </div>
          </div>

          {/* Story */}
          <Card className="border-stone-200">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="mb-6">
                  HarvestConnect was born from a simple observation: urban neighborhoods were full of passionate gardeners 
                  with abundant harvests, while many residents struggled to find fresh, affordable produce nearby.
                </p>
                <p className="mb-6">
                  Founded in 2024, we started as a small community initiative to connect these two groups. What began as 
                  a weekend farmers market in a local park has grown into a comprehensive platform that serves hundreds 
                  of families across the city.
                </p>
                <p>
                  Today, HarvestConnect is more than just a marketplace—it's a movement toward more sustainable, 
                  community-driven food systems. We're proud to support local growers while making fresh, 
                  organic produce accessible to everyone in our community.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
