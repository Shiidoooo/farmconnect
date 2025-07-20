// Shipping Calculator Utility
// Based on vehicle capacity and distance rates

export interface ShippingVehicle {
  type: string;
  maxWeight: number; // in kg
  baseFare: number;
  rates: {
    shortDistance: { rate: number; maxKm: number }; // 0-5km
    longDistance: { rate: number }; // beyond 5km
  };
  longDistanceFlat?: {
    flatFare: number;
    maxKm: number;
    rateAfter: number;
  };
}

export const SHIPPING_VEHICLES: ShippingVehicle[] = [
  {
    type: 'Motorcycle',
    maxWeight: 20,
    baseFare: 49,
    rates: {
      shortDistance: { rate: 6, maxKm: 5 },
      longDistance: { rate: 5 }
    }
  },
  {
    type: 'Sedan',
    maxWeight: 200,
    baseFare: 100,
    rates: {
      shortDistance: { rate: 18, maxKm: 5 },
      longDistance: { rate: 15 }
    }
  },
  {
    type: 'Small Truck',
    maxWeight: 800,
    baseFare: 220, // average of 200-240
    rates: {
      shortDistance: { rate: 20, maxKm: 5 }, // average of 19-20
      longDistance: { rate: 19 }
    }
  },
  {
    type: 'Medium Truck',
    maxWeight: 2000,
    baseFare: 990, // average of 940-1040
    rates: {
      shortDistance: { rate: 28, maxKm: 5 }, // average of 26-29
      longDistance: { rate: 27 }
    },
    longDistanceFlat: {
      flatFare: 2090, // average of 1980-2200
      maxKm: 40,
      rateAfter: 16 // average of 5-27
    }
  },
  {
    type: 'Large Truck',
    maxWeight: 3000,
    baseFare: 1475, // average of 1450-1500
    rates: {
      shortDistance: { rate: 33, maxKm: 5 }, // average of 32-33
      longDistance: { rate: 32 }
    },
    longDistanceFlat: {
      flatFare: 2770,
      maxKm: 40,
      rateAfter: 19 // average of 5-33
    }
  },
  {
    type: 'Extra-Large Truck (7T)',
    maxWeight: 7000,
    baseFare: 4370, // average of 4320-4420
    rates: {
      shortDistance: { rate: 49, maxKm: 5 }, // average of 48-50
      longDistance: { rate: 48 }
    }
  },
  {
    type: 'Extra-Large Truck (12T)',
    maxWeight: 12000,
    baseFare: 7200,
    rates: {
      shortDistance: { rate: 85, maxKm: 5 },
      longDistance: { rate: 85 }
    }
  }
];

export interface CartItem {
  product: {
    unit: 'per_piece' | 'per_kilo' | 'per_gram' | 'per_pound' | 'per_bundle' | 'per_pack';
    averageWeightPerPiece?: number; // in grams
    hasMultipleSizes: boolean;
    sizeVariants?: Array<{
      size: string;
      averageWeightPerPiece?: number;
    }>;
  };
  quantity: number;
  selectedSize?: string;
}

export interface ShippingCalculation {
  totalWeight: number;
  selectedVehicle: ShippingVehicle;
  baseFare: number;
  distanceFare: number;
  totalShippingCost: number;
  distance: number;
}

/**
 * Calculate the total weight of cart items
 */
export const calculateTotalWeight = (cartItems: CartItem[]): number => {
  let totalWeight = 0;

  for (const item of cartItems) {
    const { product, quantity, selectedSize } = item;
    let itemWeight = 0;

    switch (product.unit) {
      case 'per_kilo':
        itemWeight = quantity * 1000; // convert kg to grams
        break;
      
      case 'per_gram':
        itemWeight = quantity; // already in grams
        break;
      
      case 'per_pound':
        itemWeight = quantity * 453.592; // convert pounds to grams
        break;
      
      case 'per_piece':
      case 'per_bundle':
      case 'per_pack':
        if (product.hasMultipleSizes && selectedSize && product.sizeVariants) {
          const variant = product.sizeVariants.find(v => v.size === selectedSize);
          itemWeight = (variant?.averageWeightPerPiece || product.averageWeightPerPiece || 100) * quantity;
        } else {
          itemWeight = (product.averageWeightPerPiece || 100) * quantity; // default 100g if not specified
        }
        break;
      
      default:
        itemWeight = 100 * quantity; // default fallback
    }

    totalWeight += itemWeight;
  }

  return Math.ceil(totalWeight / 1000); // convert grams to kg and round up
};

/**
 * Select the appropriate vehicle based on total weight
 */
export const selectVehicle = (totalWeight: number): ShippingVehicle => {
  for (const vehicle of SHIPPING_VEHICLES) {
    if (totalWeight <= vehicle.maxWeight) {
      return vehicle;
    }
  }
  
  // If weight exceeds all vehicles, return the largest one
  return SHIPPING_VEHICLES[SHIPPING_VEHICLES.length - 1];
};

/**
 * Calculate distance fare based on vehicle rates
 */
export const calculateDistanceFare = (vehicle: ShippingVehicle, distance: number): number => {
  // If vehicle has long-distance flat rate and distance qualifies
  if (vehicle.longDistanceFlat && distance > vehicle.rates.shortDistance.maxKm) {
    if (distance <= vehicle.longDistanceFlat.maxKm) {
      return vehicle.longDistanceFlat.flatFare;
    } else {
      const remainingDistance = distance - vehicle.longDistanceFlat.maxKm;
      return vehicle.longDistanceFlat.flatFare + (remainingDistance * vehicle.longDistanceFlat.rateAfter);
    }
  }

  // Standard distance calculation
  let distanceFare = 0;
  
  if (distance <= vehicle.rates.shortDistance.maxKm) {
    // Short distance rate
    distanceFare = distance * vehicle.rates.shortDistance.rate;
  } else {
    // Short distance portion + long distance portion
    const shortDistanceFare = vehicle.rates.shortDistance.maxKm * vehicle.rates.shortDistance.rate;
    const longDistancePortion = distance - vehicle.rates.shortDistance.maxKm;
    const longDistanceFare = longDistancePortion * vehicle.rates.longDistance.rate;
    distanceFare = shortDistanceFare + longDistanceFare;
  }

  return distanceFare;
};

/**
 * Calculate shipping cost based on cart items and distance
 */
export const calculateShipping = (cartItems: CartItem[], distance: number): ShippingCalculation => {
  const totalWeight = calculateTotalWeight(cartItems);
  const selectedVehicle = selectVehicle(totalWeight);
  const baseFare = selectedVehicle.baseFare;
  const distanceFare = calculateDistanceFare(selectedVehicle, distance);
  const totalShippingCost = baseFare + distanceFare;

  return {
    totalWeight,
    selectedVehicle,
    baseFare,
    distanceFare,
    totalShippingCost: Math.ceil(totalShippingCost), // Round up to nearest peso
    distance
  };
};

/**
 * Format shipping details for display
 */
export const formatShippingDetails = (calculation: ShippingCalculation): string => {
  const { totalWeight, selectedVehicle, baseFare, distanceFare, totalShippingCost, distance } = calculation;
  
  return `${selectedVehicle.type} (${totalWeight}kg) - ${distance.toFixed(1)}km
Base fare: ₱${baseFare}
Distance fare: ₱${distanceFare}
Total: ₱${totalShippingCost}`;
};
