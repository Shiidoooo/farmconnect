import { CardHeader, CardTitle, Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";

const BanksCardsSection = () => {
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Banks & Cards</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">**** **** **** 1234</h4>
                <p className="text-sm text-gray-600">Visa ending in 1234</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Card
        </Button>
      </div>
    </div>
  );
};

export default BanksCardsSection;
