import Cart from "../Models/Cart.js";
import ProductVariant from "../Models/ProductVariant.js";
import ParentProduct from "../Models/ParentProduct.js";
import Product from "../Models/Product.js";
import { cacheGet, cacheSet, cacheDelPattern } from "../lib/cache.js";

const CART_TTL = 120;

//CARTSCHEMA->CARTITEMSCHEMA->PRODUCTID->
const calculateCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const getCart = async (req, res) => {
  const { userId } = req.params;
  const cacheKey = `cart:${userId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const cart = await Cart.findOne({ user: userId })
    .populate("items.product items.variant")
    .lean();
  console.log(cart);

  if (!cart) return res.json({ items: [], totalValue: 0 });

  cart.items.forEach((item) => {
    if (!item.image && item.product && item.product.coverImage) {
      item.image = item.product.coverImage;
    }
  });

  await cacheSet(cacheKey, cart, CART_TTL);
  res.json(cart);
};

// Add to Cart (also used for + button)
export const addToCart = async (req, res) => {
  const { userId, variantId, quantity = 1 } = req.body;

  if (quantity <= 0)
    return res.status(400).json({ message: "Invalid quantity" });

  const variant = await ProductVariant.findById(variantId).populate("product");
  console.log("variant is", variant);
  if (!variant) return res.status(404).json({ message: "Variant not found" });
  if (variant.stock < quantity)
    return res.status(400).json({ message: "Insufficient stock" });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const itemIndex = cart.items.findIndex(
    (i) => i.variant.toString() === variantId
  );

  if (itemIndex > -1) {
    if (variant.stock < cart.items[itemIndex].quantity + quantity)
      return res.status(400).json({ message: "Insufficient stock" });
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].image = variant.product.coverImage;
  } else {
    cart.items.push({
      product: variant.product._id,
      variant: variant._id,
      title: variant.product.title,
      color: variant.product.color,
      size: variant.size,
      image: variant.product.coverImage,
      price: variant.price,
      quantity,
    });
  }

  cart.totalValue = calculateCartTotal(cart.items);
  await cart.save();

  // Populate for response/cache
  await cart.populate("items.product items.variant");

  await cacheDelPattern(`cart:${userId}`);
  await cacheSet(`cart:${userId}`, cart, CART_TTL);

  res.json(cart);
};

// Remove from Cart (decrement quantity)
export const removeFromCart = async (req, res) => {
  const { userId, variantId, size } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const itemIndex = cart.items.findIndex(
    (i) => i.variant.toString() === variantId
  );
  if (itemIndex === -1)
    return res.status(404).json({ message: "Item not in cart" });

  if (cart.items[itemIndex].quantity > 1) {
    cart.items[itemIndex].quantity -= 1;
  } else {
    cart.items.splice(itemIndex, 1); // Remove completely if quantity reaches 0
  }

  cart.totalValue = calculateCartTotal(cart.items);
  await cart.save();

  // Populate for response/cache
  await cart.populate("items.product items.variant");

  // Ensure images are present
  cart.items.forEach((item) => {
    if (!item.image && item.product && item.product.coverImage) {
      item.image = item.product.coverImage;
    }
  });

  await cacheDelPattern(`cart:${userId}`);
  await cacheSet(`cart:${userId}`, cart, CART_TTL);

  res.json(cart);
};

export const deleteFromCart = async (req, res) => {
  const { userId, variantId } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => !(i.variant.toString() === variantId));

  cart.totalValue = calculateCartTotal(cart.items);
  await cart.save();

  // Populate for response/cache
  await cart.populate("items.product items.variant");

  // Ensure images are present
  cart.items.forEach((item) => {
    if (!item.image && item.product && item.product.coverImage) {
      item.image = item.product.coverImage;
    }
  });

  await cacheDelPattern(`cart:${userId}`);
  await cacheSet(`cart:${userId}`, cart, CART_TTL);

  res.json(cart);
};

// Merge guest cart with user cart (called during login/signup)
export const mergeGuestCart = async (userId, guestCartItems = []) => {
  try {
    if (!guestCartItems || guestCartItems.length === 0) {
      return { success: true, cart: null };
    }

    // Validate and fetch all variants
    const validItems = [];
    for (const item of guestCartItems) {
      const { variantId, quantity } = item;

      if (!variantId || !quantity || quantity <= 0) continue;

      const variant = await ProductVariant.findById(variantId).populate("product");
      if (!variant || !variant.product) continue;

      // Check stock availability
      if (variant.stock < quantity) {
        console.warn(`Insufficient stock for variant ${variantId}, skipping`);
        continue;
      }

      validItems.push({
        variantId: variant._id,
        productId: variant.product._id,
        quantity: Math.min(quantity, variant.stock),
        variant,
      });
    }

    if (validItems.length === 0) {
      return { success: true, cart: null, message: "No valid guest items to merge" };
    }

    // Find or create user cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    // Merge items
    for (const { variantId, productId, quantity, variant } of validItems) {
      const itemIndex = cart.items.findIndex(
        (i) => i.variant.toString() === variantId.toString()
      );

      if (itemIndex > -1) {
        // Item exists - add quantities
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (variant.stock >= newQuantity) {
          cart.items[itemIndex].quantity = newQuantity;
        } else {
          // Set to max available stock
          cart.items[itemIndex].quantity = variant.stock;
        }
      } else {
        // New item - add to cart
        cart.items.push({
          product: productId,
          variant: variantId,
          title: variant.product.title,
          color: variant.product.color,
          size: variant.size,
          image: variant.product.coverImage,
          price: variant.price,
          quantity,
        });
      }
    }

    cart.totalValue = calculateCartTotal(cart.items);
    await cart.save();

    // Populate for response
    await cart.populate("items.product items.variant");

    // Ensure images are present
    cart.items.forEach((item) => {
      if (!item.image && item.product && item.product.coverImage) {
        item.image = item.product.coverImage;
      }
    });

    // Clear cache
    await cacheDelPattern(`cart:${userId}`);
    await cacheSet(`cart:${userId}`, cart, CART_TTL);

    return { success: true, cart };
  } catch (error) {
    console.error("Error merging guest cart:", error);
    return { success: false, error: error.message };
  }
};
