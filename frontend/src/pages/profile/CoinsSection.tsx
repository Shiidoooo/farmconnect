import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CoinsSection = () => {
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">HarvestConnect Coins</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">HarvestConnect Coins</h2>
          <p>This is the HarvestConnect Coins section.</p>
        </div>
      </CardContent>
    </div>
  );
};

export default CoinsSection;
