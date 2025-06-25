# Quick MongoDB Connection Test Script for Windows PowerShell
# This script helps you test your MongoDB connection before running the migration

param(
    [string]$MongoUri = ""
)

Write-Host "🔧 MongoDB Connection Test for Zector Digital CRM" -ForegroundColor Cyan
Write-Host ""

if ($MongoUri -eq "") {
    Write-Host "Usage: .\test-mongodb-connection.ps1 -MongoUri 'your_connection_string'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Green
    Write-Host ".\test-mongodb-connection.ps1 -MongoUri 'mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority'" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or set environment variable and run migration:" -ForegroundColor Yellow
    Write-Host "`$env:MONGO_URI='your_connection_string'; node scripts/run-migration.js" -ForegroundColor Green
    exit 1
}

Write-Host "📍 Testing MongoDB connection..." -ForegroundColor Yellow
Write-Host "URI: $($MongoUri.Substring(0, [Math]::Min(50, $MongoUri.Length)))..." -ForegroundColor Gray

# Set environment variable
$env:MONGO_URI = $MongoUri

# Test the connection using Node.js
$testScript = @"
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

async function testConnection() {
    try {
        const client = new MongoClient(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxIdleTimeMS: 30000,
            tls: true,
            tlsAllowInvalidCertificates: false,
            tlsAllowInvalidHostnames: false
        });
        
        await client.connect();
        const db = client.db();
        
        // Test database operations
        const collections = await db.listCollections().toArray();
        console.log('✅ MongoDB connection successful!');
        console.log('📊 Database name:', db.databaseName);
        console.log('📁 Collections found:', collections.length);
        
        await client.close();
        process.exit(0);
    } catch (error) {
        console.log('❌ MongoDB connection failed:');
        console.log(error.message);
        process.exit(1);
    }
}

testConnection();
"@

# Write test script to temp file
$tempScript = [System.IO.Path]::GetTempFileName() + ".js"
$testScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    # Run the test
    node $tempScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🚀 Connection successful! You can now run the migration:" -ForegroundColor Green
        Write-Host "node scripts/run-migration.js" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠️  Connection failed. Please check your MongoDB URI and network settings." -ForegroundColor Red
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}
