const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const PDFDocument = require('pdfkit');

const reportsController = {
    // Get user's sales and purchase analytics
    getUserReports: async (req, res) => {
        try {
            const userId = req.user.id;
            const { timeRange = '30d' } = req.query;

            // Calculate date range
            const now = new Date();
            let startDate;
            
            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Get user's products to identify sales
            const userProducts = await Product.find({ user: userId });
            const userProductIds = userProducts.map(p => p._id);

            // Get sales data (orders containing user's products)
            const salesOrders = await Order.find({
                'products.product': { $in: userProductIds },
                createdAt: { $gte: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            }).populate({
                path: 'products.product',
                select: 'productName category user'
            }).populate('user', 'name email');

            // Get purchase data (orders made by user)
            const purchaseOrders = await Order.find({
                user: userId,
                createdAt: { $gte: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            }).populate({
                path: 'products.product',
                select: 'productName category user',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            });

            // Calculate sales metrics
            let totalSales = 0;
            let totalRevenue = 0;
            const salesData = [];
            const topProducts = {};
            const categoryData = {};

            salesOrders.forEach(order => {
                order.products.forEach(item => {
                    if (userProductIds.some(id => id.equals(item.product._id))) {
                        const itemTotal = item.price * item.quantity;
                        totalRevenue += itemTotal;
                        totalSales += item.quantity;

                        // Track top products
                        const productName = item.product.productName;
                        if (!topProducts[productName]) {
                            topProducts[productName] = {
                                name: productName,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        topProducts[productName].sales += item.quantity;
                        topProducts[productName].revenue += itemTotal;

                        // Track categories
                        const category = item.product.category || 'Other';
                        if (!categoryData[category]) {
                            categoryData[category] = {
                                name: category,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        categoryData[category].sales += item.quantity;
                        categoryData[category].revenue += itemTotal;
                    }
                });

                salesData.push({
                    orderId: order._id,
                    customer: order.user.name,
                    customerEmail: order.user.email,
                    amount: order.totalAmount,
                    date: order.createdAt,
                    status: order.status,
                    products: order.products.filter(item => 
                        userProductIds.some(id => id.equals(item.product._id))
                    ).map(item => ({
                        name: item.product.productName,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            });

            // Calculate purchase metrics
            let totalPurchases = 0;
            let totalExpenses = 0;
            const purchaseData = [];

            purchaseOrders.forEach(order => {
                order.products.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    totalExpenses += itemTotal;
                    totalPurchases += item.quantity;
                });

                purchaseData.push({
                    orderId: order._id,
                    supplier: order.products[0]?.product?.user?.name || 'Unknown',
                    amount: order.totalAmount,
                    date: order.createdAt,
                    status: order.status,
                    products: order.products.map(item => ({
                        name: item.product.productName,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            });

            // Get previous period data for growth calculation
            const prevPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
            
            const prevSalesOrders = await Order.find({
                'products.product': { $in: userProductIds },
                createdAt: { $gte: prevPeriodStart, $lt: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            });

            const prevPurchaseOrders = await Order.find({
                user: userId,
                createdAt: { $gte: prevPeriodStart, $lt: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            });

            // Calculate previous period metrics
            let prevTotalRevenue = 0;
            let prevTotalExpenses = 0;
            let prevTotalSales = 0;
            let prevTotalPurchases = 0;

            prevSalesOrders.forEach(order => {
                order.products.forEach(item => {
                    if (userProductIds.some(id => id.equals(item.product))) {
                        prevTotalRevenue += item.price * item.quantity;
                        prevTotalSales += item.quantity;
                    }
                });
            });

            prevPurchaseOrders.forEach(order => {
                order.products.forEach(item => {
                    prevTotalExpenses += item.price * item.quantity;
                    prevTotalPurchases += item.quantity;
                });
            });

            // Calculate growth percentages
            const salesGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales * 100) : 0;
            const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100) : 0;
            const purchaseGrowth = prevTotalPurchases > 0 ? ((totalPurchases - prevTotalPurchases) / prevTotalPurchases * 100) : 0;
            const expenseGrowth = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses * 100) : 0;

            // Sort and limit top products
            const sortedProducts = Object.values(topProducts)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Calculate category percentages
            const sortedCategories = Object.values(categoryData)
                .sort((a, b) => b.revenue - a.revenue)
                .map(cat => ({
                    ...cat,
                    percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue * 100) : 0
                }));

            // Get recent transactions
            const recentSales = salesData
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map(sale => ({
                    id: sale.orderId,
                    product: sale.products[0]?.name || 'Multiple Items',
                    amount: sale.amount,
                    date: sale.date.toISOString().split('T')[0],
                    customer: sale.customer
                }));

            const recentPurchases = purchaseData
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map(purchase => ({
                    id: purchase.orderId,
                    item: purchase.products[0]?.name || 'Multiple Items',
                    amount: purchase.amount,
                    date: purchase.date.toISOString().split('T')[0],
                    supplier: purchase.supplier
                }));

            // Calculate additional metrics
            const profit = totalRevenue - totalExpenses;
            const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;
            const averageOrderValue = salesData.length > 0 ? (totalRevenue / salesData.length) : 0;

            // Find best customer
            const customerSpending = {};
            salesData.forEach(sale => {
                if (!customerSpending[sale.customer]) {
                    customerSpending[sale.customer] = 0;
                }
                customerSpending[sale.customer] += sale.amount;
            });

            const bestCustomer = Object.entries(customerSpending)
                .sort(([,a], [,b]) => b - a)[0];

            res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalSales,
                        totalPurchases,
                        totalRevenue,
                        totalExpenses,
                        profit,
                        profitMargin,
                        averageOrderValue,
                        bestCustomer: bestCustomer ? {
                            name: bestCustomer[0],
                            amount: bestCustomer[1]
                        } : null
                    },
                    growth: {
                        salesGrowth: Number(salesGrowth.toFixed(1)),
                        revenueGrowth: Number(revenueGrowth.toFixed(1)),
                        purchaseGrowth: Number(purchaseGrowth.toFixed(1)),
                        expenseGrowth: Number(expenseGrowth.toFixed(1))
                    },
                    topProducts: sortedProducts,
                    categories: sortedCategories,
                    recentSales,
                    recentPurchases
                }
            });

        } catch (error) {
            console.error('Reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching reports data'
            });
        }
    },

    // Generate PDF report
    generatePDFReport: async (req, res) => {
        try {
            const userId = req.user.id;
            const { timeRange = '30d' } = req.query;

            // Get user info
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get the same data as the regular reports endpoint
            const now = new Date();
            let startDate;
            
            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Get user's products to identify sales
            const userProducts = await Product.find({ user: userId });
            const userProductIds = userProducts.map(p => p._id);

            // Get sales data
            const salesOrders = await Order.find({
                'products.product': { $in: userProductIds },
                createdAt: { $gte: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            }).populate({
                path: 'products.product',
                select: 'productName category user'
            }).populate('user', 'name email');

            // Get purchase data
            const purchaseOrders = await Order.find({
                user: userId,
                createdAt: { $gte: startDate },
                status: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] }
            }).populate({
                path: 'products.product',
                select: 'productName category user',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            });

            // Calculate metrics (same logic as getUserReports)
            let totalSales = 0;
            let totalRevenue = 0;
            let totalPurchases = 0;
            let totalExpenses = 0;
            const topProducts = {};
            const categoryData = {};

            salesOrders.forEach(order => {
                order.products.forEach(item => {
                    if (userProductIds.some(id => id.equals(item.product._id))) {
                        const itemTotal = item.price * item.quantity;
                        totalRevenue += itemTotal;
                        totalSales += item.quantity;

                        const productName = item.product.productName;
                        if (!topProducts[productName]) {
                            topProducts[productName] = {
                                name: productName,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        topProducts[productName].sales += item.quantity;
                        topProducts[productName].revenue += itemTotal;

                        const category = item.product.category || 'Other';
                        if (!categoryData[category]) {
                            categoryData[category] = {
                                name: category,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        categoryData[category].sales += item.quantity;
                        categoryData[category].revenue += itemTotal;
                    }
                });
            });

            purchaseOrders.forEach(order => {
                order.products.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    totalExpenses += itemTotal;
                    totalPurchases += item.quantity;
                });
            });

            const profit = totalRevenue - totalExpenses;
            const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

            // Sort data
            const sortedProducts = Object.values(topProducts)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            const sortedCategories = Object.values(categoryData)
                .sort((a, b) => b.revenue - a.revenue);

            // Create PDF
            const doc = new PDFDocument({
                margins: { top: 60, bottom: 60, left: 60, right: 60 },
                size: 'A4'
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="farmconnect-report-${timeRange}-${Date.now()}.pdf"`);

            // Pipe PDF to response
            doc.pipe(res);

            // Helper function to format currency
            const formatCurrency = (amount) => `₱${amount.toLocaleString()}`;

            // Helper function to format date
            const formatDate = (date) => date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            // Colors - Red-focused theme
            const colors = {
                primary: '#dc2626',     // Red (main brand)
                secondary: '#b91c1c',   // Darker red
                accent: '#f87171',      // Light red
                success: '#16a34a',     // Green for positive metrics
                dark: '#1f2937',        // Dark gray
                light: '#f3f4f6',       // Light gray
                text: '#374151'         // Medium gray
            };

            // Helper function to draw a simple header box
            const drawHeaderBox = (y, height, color) => {
                doc.rect(40, y, 515, height)
                   .fillAndStroke(color, color);
            };

            // Helper function to check for page break and add new page if needed
            const checkPageBreak = (currentY, neededSpace = 100) => {
                if (currentY + neededSpace > 700) {
                    doc.addPage();
                    return 60;
                }
                return currentY;
            };

            // Page 1: Simple Header
            let yPosition = 60;

            // Simple company header
            doc.fontSize(28)
               .fillColor(colors.primary)
               .font('Helvetica-Bold')
               .text('🌾 FarmConnect', 60, yPosition);
            
            doc.fontSize(16)
               .fillColor(colors.text)
               .font('Helvetica')
               .text('Sales & Purchase Report', 60, yPosition + 40);

            yPosition += 80;

            // Simple report metadata
            const metaData = [
                `Report For: ${user.name}`,
                `Email: ${user.email}`,
                `Generated: ${formatDate(new Date())}`,
                `Period: ${timeRange.replace('d', ' days').replace('y', ' year')}`
            ];

            metaData.forEach((item) => {
                doc.fontSize(11)
                   .fillColor(colors.text)
                   .font('Helvetica')
                   .text(item, 60, yPosition);
                yPosition += 18;
            });

            yPosition += 20;

            // Simple Executive Summary
            doc.fontSize(16)
               .fillColor(colors.primary)
               .font('Helvetica-Bold')
               .text('📊 Executive Summary', 60, yPosition);

            yPosition += 30;

            // Simple metrics table
            const metrics = [
                ['Total Sales', `${totalSales} units`],
                ['Total Revenue', formatCurrency(totalRevenue)],
                ['Total Purchases', `${totalPurchases} units`],
                ['Total Expenses', formatCurrency(totalExpenses)],
                ['Net Profit', formatCurrency(profit)],
                ['Profit Margin', `${profitMargin.toFixed(1)}%`]
            ];

            metrics.forEach(([label, value], index) => {
                const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
                doc.rect(60, yPosition, 475, 25)
                   .fillAndStroke(bgColor, '#e5e7eb');
                
                doc.fontSize(11)
                   .fillColor(colors.text)
                   .font('Helvetica-Bold')
                   .text(label, 70, yPosition + 8);
                
                doc.font('Helvetica')
                   .text(value, 300, yPosition + 8);
                
                yPosition += 25;
            });

            yPosition += 30;

            // Simple Top Products Section
            if (sortedProducts.length > 0) {
                yPosition = checkPageBreak(yPosition, 150);
                
                doc.fontSize(16)
                   .fillColor(colors.primary)
                   .font('Helvetica-Bold')
                   .text('🏆 Top Selling Products', 60, yPosition);

                yPosition += 30;

                // Simple table header
                doc.fontSize(11)
                   .fillColor(colors.dark)
                   .font('Helvetica-Bold')
                   .text('Rank', 60, yPosition)
                   .text('Product Name', 100, yPosition)
                   .text('Units Sold', 300, yPosition)
                   .text('Revenue', 400, yPosition);
                
                yPosition += 20;
                doc.moveTo(60, yPosition).lineTo(535, yPosition).stroke();
                yPosition += 10;

                sortedProducts.slice(0, 10).forEach((product, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 60;
                    }
                    
                    const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
                    doc.rect(60, yPosition - 5, 475, 20)
                       .fillAndStroke(bgColor, bgColor);
                    
                    doc.fontSize(10)
                       .fillColor(colors.text)
                       .font('Helvetica')
                       .text(`${index + 1}`, 65, yPosition)
                       .text(product.name, 100, yPosition)
                       .text(product.sales.toString(), 320, yPosition)
                       .text(formatCurrency(product.revenue), 400, yPosition);
                    
                    yPosition += 20;
                });

                yPosition += 20;
            }

            // Simple Category Analysis
            if (sortedCategories.length > 0) {
                yPosition = checkPageBreak(yPosition, 150);

                doc.fontSize(16)
                   .fillColor(colors.primary)
                   .font('Helvetica-Bold')
                   .text('📈 Sales by Category', 60, yPosition);

                yPosition += 30;

                // Simple table header
                doc.fontSize(11)
                   .fillColor(colors.dark)
                   .font('Helvetica-Bold')
                   .text('Category', 60, yPosition)
                   .text('Revenue', 200, yPosition)
                   .text('Units Sold', 300, yPosition)
                   .text('Percentage', 420, yPosition);
                
                yPosition += 20;
                doc.moveTo(60, yPosition).lineTo(535, yPosition).stroke();
                yPosition += 10;

                sortedCategories.forEach((category, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 60;
                    }
                    
                    const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue * 100) : 0;
                    const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
                    
                    doc.rect(60, yPosition - 5, 475, 20)
                       .fillAndStroke(bgColor, bgColor);
                    
                    doc.fontSize(10)
                       .fillColor(colors.text)
                       .font('Helvetica')
                       .text(category.name, 65, yPosition)
                       .text(formatCurrency(category.revenue), 200, yPosition)
                       .text(`${category.sales} units`, 300, yPosition)
                       .text(`${percentage.toFixed(1)}%`, 430, yPosition);
                    
                    yPosition += 20;
                });
            }

            // Simple Recent Transactions
            if (salesOrders.length > 0) {
                yPosition = checkPageBreak(yPosition, 150);

                doc.fontSize(16)
                   .fillColor(colors.primary)
                   .font('Helvetica-Bold')
                   .text('💼 Recent Sales Activity', 60, yPosition);

                yPosition += 30;

                const recentSales = salesOrders
                    .slice(0, 5) // Limit to 5 items to reduce size
                    .map(order => ({
                        date: order.createdAt,
                        customer: order.user.name,
                        amount: order.totalAmount,
                        status: order.status
                    }));

                // Simple table header
                doc.fontSize(11)
                   .fillColor(colors.dark)
                   .font('Helvetica-Bold')
                   .text('Date', 60, yPosition)
                   .text('Customer', 160, yPosition)
                   .text('Amount', 300, yPosition)
                   .text('Status', 420, yPosition);

                yPosition += 20;
                doc.moveTo(60, yPosition).lineTo(535, yPosition).stroke();
                yPosition += 10;

                recentSales.forEach((sale, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 60;
                    }
                    
                    const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
                    doc.rect(60, yPosition - 5, 475, 20)
                       .fillAndStroke(bgColor, bgColor);
                    
                    doc.fontSize(9)
                       .fillColor(colors.text)
                       .font('Helvetica')
                       .text(formatDate(sale.date), 65, yPosition)
                       .text(sale.customer.substring(0, 20), 160, yPosition)
                       .text(formatCurrency(sale.amount), 300, yPosition)
                       .text(sale.status.toUpperCase(), 420, yPosition);
                    
                    yPosition += 20;
                });
            }

            // Add Recent Purchase Activity
            if (purchaseOrders.length > 0) {
                yPosition = checkPageBreak(yPosition, 150);

                doc.fontSize(16)
                   .fillColor(colors.primary)
                   .font('Helvetica-Bold')
                   .text('🛒 Recent Purchase Activity', 60, yPosition);

                yPosition += 30;

                const recentPurchases = purchaseOrders
                    .slice(0, 5) // Limit to 5 items
                    .map(order => ({
                        date: order.createdAt,
                        supplier: order.products[0]?.product?.user?.name || 'Unknown Supplier',
                        item: order.products[0]?.product?.productName || 'Various Items',
                        amount: order.totalAmount,
                        status: order.status
                    }));

                // Simple table header
                doc.fontSize(11)
                   .fillColor(colors.dark)
                   .font('Helvetica-Bold')
                   .text('Date', 60, yPosition)
                   .text('Item', 140, yPosition)
                   .text('Supplier', 250, yPosition)
                   .text('Amount', 370, yPosition)
                   .text('Status', 450, yPosition);

                yPosition += 20;
                doc.moveTo(60, yPosition).lineTo(535, yPosition).stroke();
                yPosition += 10;

                recentPurchases.forEach((purchase, index) => {
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 60;
                    }
                    
                    const bgColor = index % 2 === 0 ? '#f3f4f6' : 'white';
                    doc.rect(60, yPosition - 5, 475, 20)
                       .fillAndStroke(bgColor, bgColor);
                    
                    doc.fontSize(9)
                       .fillColor(colors.text)
                       .font('Helvetica')
                       .text(formatDate(purchase.date), 65, yPosition)
                       .text(purchase.item.substring(0, 15), 140, yPosition)
                       .text(purchase.supplier.substring(0, 15), 250, yPosition)
                       .text(formatCurrency(purchase.amount), 370, yPosition)
                       .text(purchase.status.toUpperCase(), 450, yPosition);
                    
                    yPosition += 20;
                });
            }

            // Add Business Insights Section
            yPosition = checkPageBreak(yPosition, 120);

            doc.fontSize(16)
               .fillColor(colors.primary)
               .font('Helvetica-Bold')
               .text('📊 Business Insights', 60, yPosition);

            yPosition += 30;

            // Profit Analysis
            const insights = [
                ['Net Profit This Period', formatCurrency(profit)],
                ['Profit Margin', `${profitMargin.toFixed(1)}%`],
                ['Average Order Value', formatCurrency(totalRevenue / Math.max(totalSales, 1))],
                ['Total Transactions', `${totalSales + totalPurchases} orders`]
            ];

            insights.forEach(([label, value], index) => {
                const bgColor = index % 2 === 0 ? '#fef2f2' : 'white';
                doc.rect(60, yPosition, 475, 25)
                   .fillAndStroke(bgColor, '#fecaca');
                
                doc.fontSize(11)
                   .fillColor(colors.text)
                   .font('Helvetica-Bold')
                   .text(label, 70, yPosition + 8);
                
                doc.font('Helvetica')
                   .fillColor(colors.primary)
                   .text(value, 300, yPosition + 8);
                
                yPosition += 25;
            });

            yPosition += 20;

            // Growth Analysis
            if (revenueGrowth !== 0 || salesGrowth !== 0) {
                doc.fontSize(14)
                   .fillColor(colors.primary)
                   .font('Helvetica-Bold')
                   .text('📈 Growth Analysis', 60, yPosition);

                yPosition += 25;

                const growthMetrics = [
                    ['Sales Growth', `${salesGrowth > 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`],
                    ['Revenue Growth', `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`],
                    ['Purchase Growth', `${purchaseGrowth > 0 ? '+' : ''}${purchaseGrowth.toFixed(1)}%`],
                    ['Expense Growth', `${expenseGrowth > 0 ? '+' : ''}${expenseGrowth.toFixed(1)}%`]
                ];

                growthMetrics.forEach(([label, value], index) => {
                    const isPositive = value.includes('+');
                    const bgColor = index % 2 === 0 ? '#f0fdf4' : 'white';
                    const borderColor = isPositive ? '#bbf7d0' : '#fecaca';
                    
                    doc.rect(60, yPosition, 475, 22)
                       .fillAndStroke(bgColor, borderColor);
                    
                    doc.fontSize(10)
                       .fillColor(colors.text)
                       .font('Helvetica')
                       .text(label, 70, yPosition + 6);
                    
                    doc.fillColor(isPositive ? '#16a34a' : '#dc2626')
                       .font('Helvetica-Bold')
                       .text(value, 350, yPosition + 6);
                    
                    yPosition += 22;
                });
            }

            // Add simple footer to current page only
            yPosition += 30;
            doc.fontSize(8)
               .fillColor(colors.text)
               .font('Helvetica')
               .text(`Generated by FarmConnect on ${formatDate(new Date())}`, 60, yPosition);

            // Finalize PDF
            doc.end();

        } catch (error) {
            console.error('PDF generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating PDF report'
            });
        }
    }
};

module.exports = reportsController;
