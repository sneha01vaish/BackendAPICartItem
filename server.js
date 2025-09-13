// server.js
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 999.99,
    image: "https://9to5mac.com/wp-content/uploads/sites/6/2024/07/apple-device-lineup.jpg?quality=82&strip=all&w=1600",
    description: "Latest iPhone with advanced features",
    stock: 50
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    price: 899.99,
    image: "https://wallpaperaccess.com/full/9496579.jpg",
    description: "Flagship Samsung smartphone",
    stock: 30
  },
  {
    id: 3,
    name: "MacBook Pro M3",
    price: 1999.99,
    image: "https://wallpaperaccess.com/full/9496579.jpg",
    description: "Powerful laptop for professionals",
    stock: 25
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    price: 399.99,
    image: "https://wallpaperaccess.com/full/9496579.jpg",
    description: "Noise-canceling wireless headphones",
    stock: 40
  },
  {
    id: 5,
    name: "iPad Air",
    price: 599.99,
    image: "https://tse4.mm.bing.net/th/id/OIP.E9Ux33FuCo7mGLn9Ey3wnAHaE8?pid=Api&P=0&h=180",
    description: "Versatile tablet for work and play",
    stock: 35
  }
];

// In-memory cart storage (in production, use session storage or database)
const carts = new Map();

// Utility functions
const findProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

const getOrCreateCart = (sessionId) => {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }
  return carts.get(sessionId);
};

const calculateCartTotal = (cart) => {
  return cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Validation middleware
const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId || isNaN(parseInt(productId))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID. Product ID must be a number.'
    });
  }
  
  const product = findProductById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found.'
    });
  }
  
  req.product = product;
  next();
};

const validateQuantity = (req, res, next) => {
  const { quantity } = req.body;
  
  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }
  }
  
  next();
};

// Generate session ID middleware (in production, use proper session management)
const generateSessionId = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || uuidv4();
  req.sessionId = sessionId;
  res.setHeader('x-session-id', sessionId);
  next();
};

// Routes

// 1. Get all products
app.get('/api/products', (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let filteredProducts = products;
    
    // Search functionality
    if (search) {
      filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredProducts.length / limit),
          totalProducts: filteredProducts.length,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: startIndex > 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 2. Get single product by ID
app.get('/api/products/:productId', validateProductId, (req, res) => {
  try {
    res.json({
      success: true,
      data: req.product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 3. Add item to cart
app.post('/api/cart/:productId', generateSessionId, validateProductId, validateQuantity, (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const cart = getOrCreateCart(req.sessionId);
    const product = req.product;
    
    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Total would exceed stock limit of ${product.stock}.`
        });
      }
      
      cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    const total = calculateCartTotal(cart);
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart,
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 4. Get cart items
// 4. Get cart items
app.get('/api/cart', generateSessionId, (req, res) => {
  try {
    const cart = getOrCreateCart(req.sessionId);
    const total = calculateCartTotal(cart);

    res.json({
      success: true,
      data: {
        cart,
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});



// 5. Update cart item quantity
app.put('/api/cart/:productId', generateSessionId, validateProductId, validateQuantity, (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = getOrCreateCart(req.sessionId);
    const product = req.product;
    
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required for update operation.'
      });
    }
    
    const itemIndex = cart.findIndex(item => item.id === product.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.'
      });
    }
    
    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`
      });
    }
    
    cart[itemIndex].quantity = quantity;
    const total = calculateCartTotal(cart);
    
    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart,
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 6. Remove item from cart
app.delete('/api/cart/:productId', generateSessionId, (req, res) => {
  try {
    const { productId } = req.params;
    const cart = getOrCreateCart(req.sessionId);
    
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }
    
    const itemIndex = cart.findIndex(item => item.id === parseInt(productId));
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.'
      });
    }
    
    const removedItem = cart.splice(itemIndex, 1)[0];
    const total = calculateCartTotal(cart);
    
    res.json({
      success: true,
      message: `${removedItem.name} removed from cart successfully`,
      data: {
        cart,
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.length,
        removedItem
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 7. Clear entire cart
app.delete('/api/cart', generateSessionId, (req, res) => {
  try {
    const cart = getOrCreateCart(req.sessionId);
    
    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is already empty.'
      });
    }
    
    carts.set(req.sessionId, []);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: [],
        total: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;