"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.realVisitorTrackingService = void 0;
var RealVisitorTrackingService = /** @class */ (function () {
    function RealVisitorTrackingService() {
        this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://api.zectordigital.com';
        this.activeSessions = new Map();
    }
    // Store incoming tracking data from your website
    RealVisitorTrackingService.prototype.processTrackingData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, session, _a, error_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 15, , 16]);
                        sessionId = this.generateSessionId(data.ip || 'unknown', data.userAgent);
                        return [4 /*yield*/, this.getSession(sessionId)];
                    case 1:
                        session = _e.sent();
                        if (!!session) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createSession({
                                sessionId: sessionId,
                                ip: data.ip || 'unknown',
                                userAgent: data.userAgent,
                                domain: data.domain,
                                customerId: data.customerId,
                                referrer: data.referrer,
                                timestamp: new Date(data.timestamp)
                            })];
                    case 2:
                        session = _e.sent();
                        _e.label = 3;
                    case 3:
                        _a = data.event;
                        switch (_a) {
                            case 'page_view': return [3 /*break*/, 4];
                            case 'form_submission': return [3 /*break*/, 6];
                            case 'scroll_depth': return [3 /*break*/, 8];
                            case 'session_end': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 4: return [4 /*yield*/, this.recordPageView(sessionId, {
                            url: data.url,
                            title: ((_b = data.data) === null || _b === void 0 ? void 0 : _b.title) || 'Unknown',
                            timestamp: new Date(data.timestamp)
                        })];
                    case 5:
                        _e.sent();
                        return [3 /*break*/, 12];
                    case 6: return [4 /*yield*/, this.recordFormSubmission(sessionId, data.data)];
                    case 7:
                        _e.sent();
                        return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, this.updateScrollDepth(sessionId, data.url, ((_c = data.data) === null || _c === void 0 ? void 0 : _c.depth) || 0)];
                    case 9:
                        _e.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.endSession(sessionId, ((_d = data.data) === null || _d === void 0 ? void 0 : _d.duration) || 0)];
                    case 11:
                        _e.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        if (!(!session.companyInfo && data.domain)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.enrichCompanyData(sessionId, data.domain, data.ip)];
                    case 13:
                        _e.sent();
                        _e.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _e.sent();
                        console.error('Error processing tracking data:', error_1);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    // Enrich visitor data with company information
    RealVisitorTrackingService.prototype.enrichCompanyData = function (sessionId, domain, ip) {
        return __awaiter(this, void 0, void 0, function () {
            var enrichmentResults, companyInfo_1, totalConfidence_1, sourceCount_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.allSettled([
                                this.enrichFromIP(ip),
                                this.enrichFromDomain(domain),
                                this.enrichFromEmailDomains(domain),
                                this.enrichFromBusinessDirectories(domain)
                            ])];
                    case 1:
                        enrichmentResults = _a.sent();
                        companyInfo_1 = {
                            domain: domain,
                            enrichedAt: new Date(),
                            enrichmentSource: [],
                            confidence: 0
                        };
                        totalConfidence_1 = 0;
                        sourceCount_1 = 0;
                        // Process results from different enrichment sources
                        enrichmentResults.forEach(function (result, index) {
                            if (result.status === 'fulfilled' && result.value) {
                                var sources = ['ip', 'domain', 'email', 'directory'];
                                companyInfo_1.enrichmentSource.push(sources[index]);
                                // Merge data with confidence weighting
                                var data = result.value;
                                if (data.name && !companyInfo_1.name)
                                    companyInfo_1.name = data.name;
                                if (data.industry && !companyInfo_1.industry)
                                    companyInfo_1.industry = data.industry;
                                if (data.size && !companyInfo_1.size)
                                    companyInfo_1.size = data.size;
                                if (data.location && !companyInfo_1.location)
                                    companyInfo_1.location = data.location;
                                if (data.email && !companyInfo_1.email)
                                    companyInfo_1.email = data.email;
                                if (data.phone && !companyInfo_1.phone)
                                    companyInfo_1.phone = data.phone;
                                if (data.website && !companyInfo_1.website)
                                    companyInfo_1.website = data.website;
                                totalConfidence_1 += data.confidence || 0;
                                sourceCount_1++;
                            }
                        });
                        companyInfo_1.confidence = sourceCount_1 > 0 ? totalConfidence_1 / sourceCount_1 : 0;
                        if (!(companyInfo_1.confidence > 0.3)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateSessionCompanyInfo(sessionId, companyInfo_1)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, companyInfo_1];
                    case 3: return [2 /*return*/, null];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error enriching company data:', error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Enrich data from IP address (using IPinfo.io for business enrichment)
    RealVisitorTrackingService.prototype.enrichFromIP = function (ip) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, data, companyName, companyDomain, companyType, orgParts, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ip || ip === 'unknown')
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        token = 'b812b9db5828fe';
                        return [4 /*yield*/, fetch("https://ipinfo.io/".concat(ip, "/json?token=").concat(token))];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        companyName = undefined;
                        companyDomain = undefined;
                        companyType = undefined;
                        if (data.org) {
                            orgParts = data.org.split(' ');
                            if (orgParts.length > 1) {
                                companyName = orgParts.slice(1).join(' ');
                            }
                            else {
                                companyName = data.org;
                            }
                        }
                        if (data.company) {
                            companyName = data.company.name || companyName;
                            companyDomain = data.company.domain;
                            companyType = data.company.type;
                        }
                        return [2 /*return*/, {
                                name: companyName,
                                domain: companyDomain,
                                industry: companyType,
                                location: {
                                    city: data.city,
                                    country: data.country,
                                    region: data.region
                                },
                                confidence: companyName ? 0.9 : 0.7
                            }];
                    case 4:
                        error_3 = _a.sent();
                        console.error('IPinfo enrichment failed:', error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Enrich data from domain (using WHOIS and business databases)
    RealVisitorTrackingService.prototype.enrichFromDomain = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_4;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("https://api.clearbit.com/v2/companies/find?domain=".concat(domain), {
                                headers: {
                                    'Authorization': "Bearer ".concat(import.meta.env.VITE_CLEARBIT_API_KEY)
                                }
                            })];
                    case 1:
                        response = _e.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _e.sent();
                        return [2 /*return*/, {
                                name: data.name,
                                industry: (_a = data.category) === null || _a === void 0 ? void 0 : _a.industry,
                                size: this.mapEmployeeCount((_b = data.metrics) === null || _b === void 0 ? void 0 : _b.employees),
                                location: {
                                    city: (_c = data.geo) === null || _c === void 0 ? void 0 : _c.city,
                                    country: (_d = data.geo) === null || _d === void 0 ? void 0 : _d.country
                                },
                                phone: data.phone,
                                website: data.domain ? "https://".concat(data.domain) : undefined,
                                confidence: 0.9
                            }];
                    case 3: return [2 /*return*/, null];
                    case 4:
                        error_4 = _e.sent();
                        console.error('Domain enrichment failed:', error_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Enrich from email domains and patterns
    RealVisitorTrackingService.prototype.enrichFromEmailDomains = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, emails, contactEmail, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("https://api.hunter.io/v2/domain-search?domain=".concat(domain, "&api_key=").concat(import.meta.env.VITE_HUNTER_API_KEY))];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        emails = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.emails) || [];
                        if (emails.length > 0) {
                            contactEmail = emails.find(function (email) {
                                var _a, _b, _c;
                                return email.type === 'generic' ||
                                    ((_a = email.first_name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('contact')) ||
                                    ((_b = email.first_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('info')) ||
                                    ((_c = email.first_name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('sales'));
                            }) || emails[0];
                            return [2 /*return*/, {
                                    email: contactEmail.value,
                                    confidence: contactEmail.confidence / 100
                                }];
                        }
                        _b.label = 3;
                    case 3: return [2 /*return*/, null];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Email enrichment failed:', error_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Enrich from business directories
    RealVisitorTrackingService.prototype.enrichFromBusinessDirectories = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Use business directory APIs like:
                    // - Google Places API
                    // - Yelp API
                    // - Yellow Pages API
                    // - Local business databases
                    // This is a placeholder - implement based on your preferred service
                    return [2 /*return*/, null];
                }
                catch (error) {
                    console.error('Directory enrichment failed:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    // Helper methods
    RealVisitorTrackingService.prototype.generateSessionId = function (ip, userAgent) {
        var today = new Date().toISOString().split('T')[0];
        return btoa("".concat(ip, "_").concat(userAgent, "_").concat(today)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    };
    RealVisitorTrackingService.prototype.mapEmployeeCount = function (employees) {
        if (!employees)
            return 'Unknown';
        if (employees < 10)
            return '1-10';
        if (employees < 50)
            return '11-50';
        if (employees < 200)
            return '51-200';
        if (employees < 1000)
            return '201-1000';
        return '1000+';
    };
    // Database operations (implement based on your backend)
    RealVisitorTrackingService.prototype.getSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement database query to get session
                return [2 /*return*/, null];
            });
        });
    };
    RealVisitorTrackingService.prototype.createSession = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement database insert for new session
                return [2 /*return*/, {}];
            });
        });
    };
    RealVisitorTrackingService.prototype.recordPageView = function (sessionId, pageVisit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RealVisitorTrackingService.prototype.recordFormSubmission = function (sessionId, formData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RealVisitorTrackingService.prototype.updateScrollDepth = function (sessionId, url, depth) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RealVisitorTrackingService.prototype.endSession = function (sessionId, duration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    RealVisitorTrackingService.prototype.updateSessionCompanyInfo = function (sessionId, companyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    // Public API methods
    RealVisitorTrackingService.prototype.getRealTimeVisitors = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.apiEndpoint, "/api/visitors/realtime"))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Failed to get real-time visitors:', error_6);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RealVisitorTrackingService.prototype.getVisitorSessions = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        params = new URLSearchParams();
                        if (filters === null || filters === void 0 ? void 0 : filters.from)
                            params.append('from', filters.from.toISOString());
                        if (filters === null || filters === void 0 ? void 0 : filters.to)
                            params.append('to', filters.to.toISOString());
                        if (filters === null || filters === void 0 ? void 0 : filters.domain)
                            params.append('domain', filters.domain);
                        if ((filters === null || filters === void 0 ? void 0 : filters.hasCompanyInfo) !== undefined)
                            params.append('hasCompanyInfo', filters.hasCompanyInfo.toString());
                        return [4 /*yield*/, fetch("".concat(this.apiEndpoint, "/api/visitors/sessions?").concat(params))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Failed to get visitor sessions:', error_7);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RealVisitorTrackingService.prototype.getCompanyLeads = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getVisitorSessions({ hasCompanyInfo: true })];
                    case 1:
                        sessions = _a.sent();
                        return [2 /*return*/, sessions
                                .filter(function (session) { return session.companyInfo; })
                                .filter(function (session) { return !(filters === null || filters === void 0 ? void 0 : filters.minConfidence) || (session.companyInfo.confidence >= filters.minConfidence); })
                                .filter(function (session) { return !(filters === null || filters === void 0 ? void 0 : filters.industry) || session.companyInfo.industry === filters.industry; })
                                .filter(function (session) { return !(filters === null || filters === void 0 ? void 0 : filters.size) || session.companyInfo.size === filters.size; })
                                .filter(function (session) { return !(filters === null || filters === void 0 ? void 0 : filters.hasContactInfo) || (session.companyInfo.email || session.companyInfo.phone); })
                                .map(function (session) { return _this.sessionToCompany(session); })
                                .filter(function (company, index, arr) { return arr.findIndex(function (c) { return c.domain === company.domain; }) === index; })]; // Remove duplicates
                    case 2:
                        error_8 = _a.sent();
                        console.error('Failed to get company leads:', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RealVisitorTrackingService.prototype.sessionToCompany = function (session) {
        var _a, _b;
        var companyInfo = session.companyInfo;
        return {
            id: session.id,
            name: companyInfo.name || companyInfo.domain,
            domain: companyInfo.domain,
            industry: companyInfo.industry || 'Unknown',
            size: companyInfo.size || 'Unknown', location: {
                city: ((_a = companyInfo.location) === null || _a === void 0 ? void 0 : _a.city) || 'Unknown',
                country: ((_b = companyInfo.location) === null || _b === void 0 ? void 0 : _b.country) || 'Unknown'
            },
            lastVisit: session.timestamp,
            totalVisits: session.pages.length,
            score: Math.round(companyInfo.confidence * 100),
            status: this.calculateLeadStatus(session),
            tags: this.generateTags(session)
        };
    };
    RealVisitorTrackingService.prototype.calculateLeadStatus = function (session) {
        var _a, _b, _c;
        var score = ((_a = session.companyInfo) === null || _a === void 0 ? void 0 : _a.confidence) || 0;
        var pageViews = session.pages.length;
        var hasContactInfo = !!(((_b = session.companyInfo) === null || _b === void 0 ? void 0 : _b.email) || ((_c = session.companyInfo) === null || _c === void 0 ? void 0 : _c.phone));
        if (score > 0.8 && pageViews >= 3 && hasContactInfo)
            return 'hot';
        if (score > 0.5 && pageViews >= 2)
            return 'warm';
        return 'cold';
    };
    RealVisitorTrackingService.prototype.generateTags = function (session) {
        var _a, _b, _c;
        var tags = [];
        if ((_a = session.companyInfo) === null || _a === void 0 ? void 0 : _a.email)
            tags.push('Has Email');
        if ((_b = session.companyInfo) === null || _b === void 0 ? void 0 : _b.phone)
            tags.push('Has Phone');
        if (session.pages.length >= 5)
            tags.push('High Engagement');
        if (((_c = session.companyInfo) === null || _c === void 0 ? void 0 : _c.confidence) && session.companyInfo.confidence > 0.8)
            tags.push('High Confidence');
        if (session.sessionDuration && session.sessionDuration > 300000)
            tags.push('Long Session'); // 5+ minutes
        return tags;
    };
    return RealVisitorTrackingService;
}());
exports.realVisitorTrackingService = new RealVisitorTrackingService();
