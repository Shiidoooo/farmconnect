
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Award, Leaf, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Leaf,
      title: "100% Organic",
      description: "All products are grown without harmful pesticides or chemicals"
    },
    {
      icon: Users,
      title: "Local Community",
      description: "Supporting backyard farmers and local growers in your area"
    },
    {
      icon: Truck,
      title: "Fresh Delivery",
      description: "Harvest to doorstep in 24 hours or less"
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Every product meets our strict quality standards"
    }
  ];

  return (
    <section className="py-20 bg-farm-white-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Why Choose UrbanFarmLink?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We connect you directly with local backyard farmers, ensuring the freshest produce and supporting your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-farm-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-farm-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
