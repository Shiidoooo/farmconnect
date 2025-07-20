const mongoose = require('mongoose');

class DeliveryCalculator {
    constructor() {
        // Delivery vehicle configurations based on Lalamove Metro Manila rates
        this.vehicles = {
            motorcycle: {
                name: 'Motorcycle',
                maxWeight: 20000, // 20kg in grams
                baseFee: 49, // Base delivery fee in PHP
                shortDistanceRate: 6, // PHP per km (0-5km)
                longDistanceRate: 5, // PHP per km (beyond 5km)
                shortDistanceLimit: 5 // km
            },
            sedan: {
                name: 'Sedan',
                maxWeight: 200000, // 200kg in grams
                baseFee: 100, // Base delivery fee in PHP
                shortDistanceRate: 18, // PHP per km (0-5km)
                longDistanceRate: 15, // PHP per km (above 5km)
                shortDistanceLimit: 5 // km
            },
            small_truck: {
                name: 'Small Truck / MPV',
                maxWeight: 800000, // 800kg in grams
                baseFee: 220, // Average base fare in PHP
                perKmRate: 19.5, // Average per km rate
                longDistanceThreshold: 40 // km
            },
            medium_truck: {
                name: 'Medium Truck',
                maxWeight: 2000000, // 2000kg in grams
                baseFee: 990, // Average base fare in PHP
                perKmRate: 27.5, // Average per km rate
                longDistanceBaseFare: 2090, // For first 40km
                longDistanceThreshold: 40, // km
                longDistanceRate: 16 // PHP per km beyond 40km
            },
            large_truck: {
                name: 'Large Truck',
                maxWeight: 3000000, // 3000kg in grams
                baseFee: 1475, // Average base fare in PHP
                perKmRate: 32.5, // Average per km rate
                longDistanceBaseFare: 2770, // For first 40km
                longDistanceThreshold: 40, // km
                longDistanceRate: 19 // PHP per km beyond 40km
            },
            extra_large_7t: {
                name: 'Extra Large Truck (7T)',
                maxWeight: 7000000, // 7000kg in grams
                baseFee: 4370, // Average base fare in PHP
                perKmRate: 49, // Average per km rate
                longDistanceThreshold: 40 // km
            },
            extra_large_12t: {
                name: 'Extra Large Truck (12T)',
                maxWeight: 12000000, // 12000kg in grams
                baseFee: 7200, // Base fare in PHP
                perKmRate: 85, // Per km rate
                longDistanceThreshold: 40 // km
            }
        };
        
        // Default to motorcycle for farm products
        this.defaultVehicle = 'motorcycle';
    }

    /**
     * Calculate total weight of an order
     * @param {Array} orderItems - Array of order items with product and quantity
     * @returns {number} Total weight in grams
     */
    calculateOrderWeight(orderItems) {
        let totalWeight = 0;

        for (const item of orderItems) {
            const product = item.product;
            const quantity = item.quantity;
            let itemWeight = 0;

            // Handle products with multiple sizes
            if (product.hasMultipleSizes && item.selectedSize) {
                const sizeVariant = product.sizeVariants.find(variant => variant.size === item.selectedSize);
                if (sizeVariant && sizeVariant.averageWeightPerPiece) {
                    itemWeight = sizeVariant.averageWeightPerPiece * quantity;
                } else {
                    // Fallback weight estimation based on size
                    itemWeight = this.estimateWeightBySize(item.selectedSize, product.productCategory) * quantity;
                }
            } 
            // Handle single-size products
            else if (product.averageWeightPerPiece) {
                itemWeight = product.averageWeightPerPiece * quantity;
            }
            // Fallback weight estimation by category and unit
            else {
                itemWeight = this.estimateWeightByCategory(product.productCategory, product.unit, quantity);
            }

            totalWeight += itemWeight;
        }

        return Math.round(totalWeight);
    }

    /**
     * Estimate weight by size for products without specific weight data
     * @param {string} size - Product size (xs, s, m, l, xl, xxl)
     * @param {string} category - Product category
     * @returns {number} Estimated weight per piece in grams
     */
    estimateWeightBySize(size, category) {
        const sizeMultipliers = {
            'xs': 0.5,
            's': 0.7,
            'm': 1.0,
            'l': 1.5,
            'xl': 2.0,
            'xxl': 2.5
        };

        const baseWeight = this.getCategoryBaseWeight(category);
        const multiplier = sizeMultipliers[size] || 1.0;
        
        return baseWeight * multiplier;
    }

    /**
     * Estimate weight by category and unit
     * @param {string} category - Product category
     * @param {string} unit - Product unit
     * @param {number} quantity - Quantity
     * @returns {number} Estimated total weight in grams
     */
    estimateWeightByCategory(category, unit, quantity) {
        const baseWeight = this.getCategoryBaseWeight(category);
        
        // Calculate weight based on unit type
        let totalWeight = 0;
        
        switch (unit) {
            case 'per_kilo':
                totalWeight = quantity * 1000; // quantity is in kg, convert to grams
                break;
            case 'per_gram':
                totalWeight = quantity; // quantity is already in grams
                break;
            case 'per_pound':
                totalWeight = quantity * 453.592; // convert pounds to grams
                break;
            case 'per_bundle':
                totalWeight = quantity * 500; // assume 500g per bundle
                break;
            case 'per_pack':
                totalWeight = quantity * 250; // assume 250g per pack
                break;
            case 'per_piece':
            default:
                totalWeight = quantity * baseWeight; // use base weight per piece
                break;
        }

        return totalWeight;
    }

    /**
     * Get base weight by category
     * @param {string} category - Product category
     * @returns {number} Base weight in grams
     */
    getCategoryBaseWeight(category) {
        const categoryWeights = {
            'vegetables': 150, // Average 150g per piece
            'fruits': 200, // Average 200g per piece
            'herbs': 50, // Average 50g per piece
            'grains': 500, // Average 500g per portion
            'dairy': 250, // Average 250g per piece
            'meat': 300, // Average 300g per piece
            'seafood': 250, // Average 250g per piece
            'nuts': 100, // Average 100g per portion
            'seeds': 50, // Average 50g per portion
            'spices': 25, // Average 25g per portion
        };

        return categoryWeights[category.toLowerCase()] || 200; // Default 200g
    }

    /**
     * Auto-select the most appropriate vehicle based on weight
     * @param {number} totalWeight - Total weight in grams
     * @returns {string} Vehicle type key
     */
    selectOptimalVehicle(totalWeight) {
        // Sort vehicles by weight capacity
        const sortedVehicles = Object.entries(this.vehicles)
            .sort((a, b) => a[1].maxWeight - b[1].maxWeight);

        // Find the smallest vehicle that can handle the weight
        for (const [vehicleType, vehicle] of sortedVehicles) {
            if (totalWeight <= vehicle.maxWeight) {
                return vehicleType;
            }
        }

        // If weight exceeds all vehicles, use the largest
        return sortedVehicles[sortedVehicles.length - 1][0];
    }

    /**
     * Calculate distance-based pricing for a vehicle
     * @param {Object} vehicle - Vehicle configuration
     * @param {number} distance - Distance in kilometers
     * @returns {number} Distance cost in PHP
     */
    calculateDistanceCost(vehicle, distance) {
        // Handle motorcycle and sedan with dual rate structure
        if (vehicle.shortDistanceRate && vehicle.longDistanceRate) {
            const shortDistance = Math.min(distance, vehicle.shortDistanceLimit);
            const longDistance = Math.max(0, distance - vehicle.shortDistanceLimit);
            
            return (shortDistance * vehicle.shortDistanceRate) + 
                   (longDistance * vehicle.longDistanceRate);
        }
        
        // Handle trucks with long-distance thresholds
        if (vehicle.longDistanceThreshold && distance > vehicle.longDistanceThreshold) {
            if (vehicle.longDistanceBaseFare && vehicle.longDistanceRate) {
                // Medium/Large trucks with special long-distance rates
                const extraDistance = distance - vehicle.longDistanceThreshold;
                return vehicle.longDistanceBaseFare - vehicle.baseFee + 
                       (extraDistance * vehicle.longDistanceRate);
            }
        }
        
        // Standard per-km rate for all other cases
        return distance * (vehicle.perKmRate || 0);
    }

    /**
     * Calculate delivery cost based on weight, distance, and vehicle capacity
     * @param {number} totalWeight - Total weight in grams
     * @param {number} distance - Distance in kilometers
     * @param {string} vehicleType - Type of vehicle (optional, auto-selected if null)
     * @returns {Object} Delivery calculation details
     */
    calculateDeliveryCost(totalWeight, distance = 5, vehicleType = null) {
        // Auto-select vehicle based on weight if not specified
        if (!vehicleType) {
            vehicleType = this.selectOptimalVehicle(totalWeight);
        }

        const vehicle = this.vehicles[vehicleType];
        if (!vehicle) {
            throw new Error(`Invalid vehicle type: ${vehicleType}`);
        }

        // Calculate if weight exceeds vehicle capacity (needs multiple trips)
        const tripsNeeded = Math.ceil(totalWeight / vehicle.maxWeight);
        
        // Calculate base cost and distance cost
        const baseCost = vehicle.baseFee;
        const distanceCost = this.calculateDistanceCost(vehicle, distance);
        const costPerTrip = baseCost + distanceCost;
        
        // Calculate total cost (multiply by trips if needed)
        const totalCost = costPerTrip * tripsNeeded;

        // Prepare warnings and recommendations
        const warnings = [];
        const recommendations = [];
        
        if (tripsNeeded > 1) {
            warnings.push(`Order weight (${(totalWeight/1000).toFixed(1)}kg) exceeds vehicle capacity (${vehicle.maxWeight/1000}kg)`);
            warnings.push(`${tripsNeeded} separate deliveries will be required`);
            
            // Suggest larger vehicle if available
            const optimalVehicle = this.selectOptimalVehicle(totalWeight);
            if (optimalVehicle !== vehicleType) {
                const betterVehicle = this.vehicles[optimalVehicle];
                const betterCost = betterVehicle.baseFee + this.calculateDistanceCost(betterVehicle, distance);
                recommendations.push(`Consider using ${betterVehicle.name} for ₱${betterCost} (single trip)`);
            }
        }

        // Weight efficiency warning
        const weightUtilization = (totalWeight / vehicle.maxWeight) * 100;
        if (weightUtilization < 30 && vehicleType !== 'motorcycle') {
            const smallerVehicle = this.selectOptimalVehicle(totalWeight * 0.8); // Find smaller suitable vehicle
            if (smallerVehicle !== vehicleType) {
                const smallerVehicleObj = this.vehicles[smallerVehicle];
                const smallerCost = smallerVehicleObj.baseFee + this.calculateDistanceCost(smallerVehicleObj, distance);
                recommendations.push(`Consider using ${smallerVehicleObj.name} for ₱${smallerCost} (more cost-effective)`);
            }
        }

        return {
            vehicleType,
            vehicleName: vehicle.name,
            totalWeight,
            totalWeightKg: (totalWeight / 1000).toFixed(1),
            distance,
            tripsNeeded,
            maxWeightPerTrip: vehicle.maxWeight,
            maxWeightPerTripKg: (vehicle.maxWeight / 1000).toFixed(1),
            weightUtilization: Math.min(100, weightUtilization).toFixed(1),
            baseFee: baseCost,
            distanceFee: distanceCost,
            costPerTrip,
            totalCost: Math.round(totalCost),
            warnings,
            recommendations,
            breakdown: {
                baseFee: baseCost,
                distanceFee: distanceCost,
                trips: tripsNeeded,
                costPerTrip: costPerTrip
            }
        };
    }

    /**
     * Calculate delivery cost for an order with multiple sellers
     * @param {Array} sellerGroups - Array of seller groups with their products
     * @param {number} baseDistance - Base distance in kilometers
     * @returns {Object} Complete delivery calculation
     */
    calculateMultiSellerDelivery(sellerGroups, baseDistance = 5) {
        const deliveryDetails = [];
        let totalDeliveryCost = 0;
        let totalWeight = 0;
        let maxTrips = 0;
        const allWarnings = [];

        for (const sellerGroup of sellerGroups) {
            const sellerWeight = this.calculateOrderWeight(sellerGroup.items);
            const sellerDelivery = this.calculateDeliveryCost(sellerWeight, baseDistance);
            
            deliveryDetails.push({
                sellerId: sellerGroup.sellerId,
                sellerName: sellerGroup.sellerName,
                ...sellerDelivery
            });

            totalDeliveryCost += sellerDelivery.totalCost;
            totalWeight += sellerWeight;
            maxTrips = Math.max(maxTrips, sellerDelivery.tripsNeeded);
            allWarnings.push(...sellerDelivery.warnings);
        }

        return {
            deliveryDetails,
            summary: {
                totalWeight,
                totalWeightKg: (totalWeight / 1000).toFixed(1),
                totalCost: Math.round(totalDeliveryCost),
                maxTripsNeeded: maxTrips,
                sellersCount: sellerGroups.length,
                warnings: [...new Set(allWarnings)] // Remove duplicates
            }
        };
    }

    /**
     * Get alternative delivery options with all suitable vehicles
     * @param {number} totalWeight - Total weight in grams
     * @param {number} distance - Distance in kilometers
     * @returns {Array} Array of delivery options sorted by cost
     */
    getDeliveryOptions(totalWeight, distance = 5) {
        const options = [];
        const optimalVehicle = this.selectOptimalVehicle(totalWeight);
        
        for (const [vehicleType, vehicle] of Object.entries(this.vehicles)) {
            try {
                const calculation = this.calculateDeliveryCost(totalWeight, distance, vehicleType);
                
                // Determine if this is a viable option
                let viability = 'suitable';
                if (totalWeight > vehicle.maxWeight) {
                    viability = 'requires_multiple_trips';
                } else if (vehicleType === optimalVehicle) {
                    viability = 'optimal';
                } else if ((totalWeight / vehicle.maxWeight) < 0.3) {
                    viability = 'oversized';
                }
                
                options.push({
                    id: vehicleType,
                    name: vehicle.name,
                    maxCapacity: `${vehicle.maxWeight / 1000}kg`,
                    recommended: vehicleType === optimalVehicle,
                    viability: viability,
                    efficiency: `${calculation.weightUtilization}%`,
                    ...calculation
                });
            } catch (error) {
                console.error(`Error calculating for ${vehicleType}:`, error);
            }
        }

        // Sort by total cost, but prioritize optimal and suitable options
        return options.sort((a, b) => {
            // First priority: viability
            const viabilityOrder = { 'optimal': 0, 'suitable': 1, 'oversized': 2, 'requires_multiple_trips': 3 };
            const viabilityDiff = viabilityOrder[a.viability] - viabilityOrder[b.viability];
            if (viabilityDiff !== 0) return viabilityDiff;
            
            // Second priority: cost
            return a.totalCost - b.totalCost;
        });
    }
}

module.exports = DeliveryCalculator;
