"use strict";
// Backend Tracking Endpoint - Handle incoming visitor data
// TypeScript implementation
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var realVisitorTrackingService_1 = require("../services/realVisitorTrackingService");
var mongoose_1 = require("mongoose");
var dotenv_1 = require("dotenv");
// Initialize environment variables
dotenv_1.default.config();
// Create Express app
var app = (0, express_1.default)();
// Setup middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB connection setup
var connectDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mongoURI, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zector-digital-crm';
                console.log('🔌 TypeScript: Connecting to MongoDB...');
                return [4 /*yield*/, mongoose_1.default.connect(mongoURI)];
            case 1:
                _a.sent();
                console.log('📊 TypeScript: MongoDB Connected Successfully!');
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                console.error('❌ TypeScript: MongoDB Connection Error:', error_1);
                // Fallback to in-memory storage in case of connection failure
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Define simplified schemas for this TypeScript implementation
var companySchema = new mongoose_1.default.Schema({
    name: String,
    domain: { type: String, required: true, index: true },
    industry: String,
    size: String,
    location: {
        city: String,
        country: String
    },
    phone: String,
    email: String,
    website: String,
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    totalVisits: { type: Number, default: 1 },
    score: { type: Number, default: 50 },
    status: {
        type: String,
        enum: ['hot', 'warm', 'cold'],
        default: 'cold'
    },
    tags: [String]
});
var Company = mongoose_1.default.model('Company', companySchema);
// Global database connection flag
var dbConnected = false;
// Connect to MongoDB
connectDB().then(function (connected) {
    dbConnected = connected;
});
// Main tracking endpoint that receives data from your website
app.post('/track', function (req, res) {
    try {
        var trackingData = req.body;
        // Extract real IP address (considering proxies/load balancers)
        var ip = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.ip;
        // Add IP to tracking data
        trackingData.ip = ip;
        // Validate required fields
        if (!trackingData.customerId || !trackingData.domain || !trackingData.event) {
            return res.status(400).json({
                error: 'Missing required fields: customerId, domain, event'
            });
        }
        // Process the tracking data
        realVisitorTrackingService_1.realVisitorTrackingService.processTrackingData(trackingData).then(function () {
            res.status(200).json({
                success: true,
                message: 'Tracking data processed successfully'
            });
        });
    }
    catch (error) {
        console.error('Tracking endpoint error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process tracking data'
        });
    }
});
// API endpoints for the dashboard
app.get('/api/visitors/realtime', function (req, res) {
    if (dbConnected) {
        // Use MongoDB for real-time visitor data
        var cutoff = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes
        Company.find({ lastVisit: { $gte: cutoff } })
            .sort({ lastVisit: -1 })
            .limit(50)
            .lean()
            .then(function (recentCompanies) {
            // Transform to expected format
            var visitors = recentCompanies.map(function (company) { return ({
                sessionId: "session_".concat(company._id),
                ip: '192.168.0.1', // Anonymized for privacy
                currentPage: '/',
                startTime: company.firstVisit,
                lastActivity: company.lastVisit,
                pageViews: company.totalVisits,
                companyInfo: {
                    name: company.name || company.domain,
                    domain: company.domain,
                    industry: company.industry,
                    size: company.size,
                    confidence: company.score / 100,
                    phone: company.phone,
                    email: company.email,
                    website: company.website
                },
                isActive: true
            }); });
            res.json(visitors);
        })
            .catch(function (error) {
            console.error('Real-time visitors error:', error);
            res.status(500).json({ error: 'Failed to get real-time visitors' });
        });
    }
    else {
        realVisitorTrackingService_1.realVisitorTrackingService.getRealTimeVisitors()
            .then(function (visitors) {
            res.json(visitors);
        })
            .catch(function (error) {
            console.error('Real-time visitors error:', error);
            res.status(500).json({ error: 'Failed to get real-time visitors' });
        });
    }
});
// API endpoint for filtered companies
app.get('/api/companies/filtered', function (req, res) {
    console.log('🔍 [TypeScript] Filtered companies endpoint called with query:', req.query);
    try {
        // Parse query parameters
        var _a = req.query, status_1 = _a.status, industry_1 = _a.industry, search_1 = _a.search, sortBy_1 = _a.sortBy, _b = _a.limit, limit_1 = _b === void 0 ? 20 : _b;
        if (dbConnected) {
            // Build MongoDB query based on filters
            var query = {};
            // Filter by status
            if (status_1 && status_1 !== 'all') {
                query.status = status_1;
            }
            // Filter by industry
            if (industry_1 && industry_1 !== 'all') {
                query.industry = industry_1;
            }
            // Search by name, domain, email, website
            if (search_1) {
                var searchRegex = new RegExp(search_1, 'i');
                query.$or = [
                    { name: searchRegex },
                    { domain: searchRegex },
                    { email: searchRegex },
                    { website: searchRegex }
                ];
            }
            // Determine sort order
            var sortOptions = {};
            switch (sortBy_1) {
                case 'score':
                    sortOptions.score = -1;
                    break;
                case 'totalVisits':
                    sortOptions.totalVisits = -1;
                    break;
                default:
                    sortOptions.lastVisit = -1;
            }
            // Execute query with filtering, sorting, and limiting
            Company.find(query)
                .sort(sortOptions)
                .limit(parseInt(limit_1))
                .lean()
                .then(function (companies) {
                // Format response
                var formattedCompanies = companies.map(function (company) { return ({
                    id: company._id.toString(),
                    name: company.name || "Unknown (".concat(company.domain, ")"),
                    domain: company.domain,
                    industry: company.industry || 'Unknown',
                    size: company.size || 'Unknown',
                    location: company.location || { city: 'Unknown', country: 'Unknown' },
                    lastVisit: company.lastVisit,
                    totalVisits: company.totalVisits,
                    score: company.score,
                    status: company.status,
                    tags: company.tags || [],
                    phone: company.phone,
                    email: company.email,
                    website: company.website || "https://".concat(company.domain)
                }); });
                res.json(formattedCompanies);
            })
                .catch(function (error) {
                console.error('[TypeScript] MongoDB query error:', error);
                res.status(500).json({ error: 'Failed to query database' });
            });
        }
        else {
            // Start with all company leads
            realVisitorTrackingService_1.realVisitorTrackingService.getCompanyLeads()
                .then(function (companies) {
                // Apply filters
                var filteredCompanies = __spreadArray([], companies, true);
                if (status_1 && status_1 !== 'all') {
                    filteredCompanies = filteredCompanies.filter(function (c) { return c.status === status_1; });
                }
                if (industry_1 && industry_1 !== 'all') {
                    filteredCompanies = filteredCompanies.filter(function (c) { return c.industry === industry_1; });
                }
                if (search_1) {
                    var searchLower_1 = search_1.toLowerCase();
                    filteredCompanies = filteredCompanies.filter(function (c) {
                        return (c.name && c.name.toLowerCase().includes(searchLower_1)) ||
                            (c.domain && c.domain.toLowerCase().includes(searchLower_1)) ||
                            (c.email && c.email.toLowerCase().includes(searchLower_1)) ||
                            (c.website && c.website.toLowerCase().includes(searchLower_1));
                    });
                }
                // Apply sorting
                switch (sortBy_1) {
                    case 'score':
                        filteredCompanies.sort(function (a, b) { return b.score - a.score; });
                        break;
                    case 'totalVisits':
                        filteredCompanies.sort(function (a, b) { return b.totalVisits - a.totalVisits; });
                        break;
                    case 'lastVisit':
                    default:
                        filteredCompanies.sort(function (a, b) {
                            var dateA = a.lastVisit instanceof Date ? a.lastVisit : new Date(a.lastVisit);
                            var dateB = b.lastVisit instanceof Date ? b.lastVisit : new Date(b.lastVisit);
                            return dateB.getTime() - dateA.getTime();
                        });
                }
                // Apply limit
                var limitNum = parseInt(limit_1);
                filteredCompanies = filteredCompanies.slice(0, limitNum);
                res.json(filteredCompanies);
            })
                .catch(function (error) {
                console.error('[TypeScript] Filtering error:', error);
                res.status(500).json({ error: 'Failed to get filtered companies' });
            });
        }
    }
    catch (error) {
        console.error('[TypeScript] Filtered companies error:', error);
        res.status(500).json({ error: 'Failed to get filtered companies' });
    }
});
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        implementationType: 'TypeScript',
        databaseConnected: dbConnected
    });
});
// Try to start the server with port checking
var PORT = process.env.PORT || 3001;
var server = app.listen(PORT, function () {
    console.log("\uD83D\uDE80 TypeScript Tracking server running on port ".concat(PORT));
    console.log("\uD83D\uDCCA API endpoints available at http://localhost:".concat(PORT));
    console.log("\u2764\uFE0F  Health check: http://localhost:".concat(PORT, "/health"));
}).on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        console.log("\u26A0\uFE0F  Port ".concat(PORT, " is already in use. This is normal if the main server.cjs is running."));
        console.log("\u2139\uFE0F  The TypeScript implementation is meant for development/testing purposes.");
    }
    else {
        console.error('Server error:', err);
    }
});
exports.default = app;
