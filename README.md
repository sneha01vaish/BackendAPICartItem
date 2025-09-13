# BackendAPICartItem
API for Adding updating and other functionalites of cart.
Product Cart API
A RESTful API built with Node.js and Express.js that provides product listing and shopping cart functionality. Features include product management, cart operations, session-based storage, and comprehensive error handling.

Features
📦 Product Management - List products with pagination and search

🛒 Shopping Cart - Add, update, remove items with session management

✅ Input Validation - Comprehensive validation and error handling

🔄 Session Support - Session-based cart storage using UUID

🎯 RESTful Design - Clean API endpoints following REST principles

#Tech Stack
Backend: Node.js, Express.js
Language: JavaScript (ES6+)
Storage: In-memory (production ready for database integration)
Dependencies: express, cors, uuid
Quick Start
Prerequisites
Node.js 14+ installed
npm or yarn package manager
Installation
Clone the repository
bash
   git clone <repository-url>
   cd product-cart-api
Install dependencies
bash
   npm install
Start the server
bash
   # Development mode (auto-restart on changes)
   npm run dev
   
   # Or production mode
   npm start
Verify installation
bash
   curl http://localhost:3000/api/health
The server will run on http://localhost:3000

API Endpoints
Products
Get All Products
http
GET /api/products
Query Parameters:

page (optional) - Page number for pagination
limit (optional) - Items per page
search (optional) - Search by product name/description
Example:

bash
curl "http://localhost:3000/api/products?page=1&limit=5&search=iPhone"
Get Single Product
http
GET /api/products/:productId
Example:

bash
curl http://localhost:3000/api/products/1
Cart Operations
Note: Include x-session-id header for session management (auto-generated if not provided)

View Cart
http
GET /api/cart
Example:

bash
curl -H "x-session-id: your-session-id" http://localhost:3000/api/cart
Add to Cart
http
POST /api/cart/:productId
Body:

json
{
  "quantity": 2
}
Example:

bash
curl -X POST http://localhost:3000/api/cart/1 \
  -H "Content-Type: application/json" \
  -H "x-session-id: your-session-id" \
  -d '{"quantity": 2}'
Update Cart Item
http
PUT /api/cart/:productId
Body:

json
{
  "quantity": 3
}
Remove Item from Cart
http
DELETE /api/cart/:productId
Example:

bash
curl -X DELETE http://localhost:3000/api/cart/1 \
  -H "x-session-id: your-session-id"
Clear Cart
http
DELETE /api/cart
Utility
Health Check
http
GET /api/health
Response Format
Success Response
json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 1999.98,
    "itemCount": 2
  }
}
Error Response
json
{
  "success": false,
  "message": "Product not found."
}
Sample Data
The API comes with 5 sample products:

iPhone 15 Pro ($999.99)
Samsung Galaxy S24 ($899.99)
MacBook Pro M3 ($1999.99)
Sony WH-1000XM5 ($399.99)
iPad Air ($599.99)
Error Handling
The API includes comprehensive error handling for:

❌ Invalid product IDs
❌ Invalid quantities
❌ Insufficient stock
❌ Items not found in cart
❌ Server errors with proper HTTP status codes
Testing
Using cURL
bash
# Get all products
curl http://localhost:3000/api/products

# Add item to cart
curl -X POST http://localhost:3000/api/cart/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 1}'

# View cart
curl http://localhost:3000/api/cart
Using Postman
Import the API endpoints
Set base URL to http://localhost:3000/api
Add x-session-id header for cart operations
Test all endpoints with different scenarios

#Project Structure

BackendAPICartItem/

├── server.js          # Main server file with all routes
├── package.json       # Dependencies and scripts

#Key Features Implemented

✅ Product Listing

✅ Cart Management with session support

✅ Input Validation and error handling

✅ Stock Management and availability checks

✅ RESTful API design with proper HTTP methods

✅ ES6 JavaScript with modern syntax

✅ Session Management using UUID



Built with using Node.js and Express.js


