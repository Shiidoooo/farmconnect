import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const VouchersSection = () => {
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Vouchers</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vouchers</h2>
          <p>This is the vouchers section.</p>
        </div>
      </CardContent>
    </div>
  );
};

export default VouchersSection;
