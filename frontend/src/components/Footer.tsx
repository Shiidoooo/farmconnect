
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-stone-800 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">UrbanFarmLink</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Connecting communities through fresh, local, organic produce from backyard gardens.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Vegetables</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Fruits</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Herbs</a></li>
              <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Garden Goods</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-sage-400" />
                <span className="text-stone-400">hello@urbanfarmlink.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-sage-400" />
                <span className="text-stone-400">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-sage-400" />
                <span className="text-stone-400">Local Community Network</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-8 text-center">
          <p className="text-stone-400">
            © 2024 UrbanFarmLink. All rights reserved. Supporting local communities, one garden at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
