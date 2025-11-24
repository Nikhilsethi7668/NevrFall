import User from "../Models/User.js";

// Phone number validation for Indian numbers (10 digits, optionally with country code)
const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  // Remove any spaces, dashes, or plus signs
  const cleaned = phone.replace(/[\s\-+]/g, "");
  // Check if it's 10 digits (without country code) or 10-13 digits (with country code)
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
};

export const addAddress = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone, pincode, line1, line2, city, state, isDefault } =
      req.body;

    // Validate required fields
    if (!name || !phone || !pincode || !line1 || !city || !state) {
      return res.status(400).json({
        message:
          "Missing required fields: name, phone, pincode, line1, city, and state are required",
      });
    }

    // Validate phone number
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        message:
          "Invalid phone number. Please provide a valid 10-digit Indian phone number",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine if this should be default
    // If user has no addresses, make this default regardless of input
    const hasNoAddresses = !user.addresses || user.addresses.length === 0;
    const shouldBeDefault = hasNoAddresses || isDefault === true;

    // If setting as default and there are existing addresses, set all others to false
    if (shouldBeDefault && !hasNoAddresses) {
      user.addresses.forEach((addr) => {
        addr.default = false;
      });
      // Mark addresses array as modified to ensure Mongoose tracks the change
      user.markModified("addresses");
    }

    // Create new address object
    const newAddress = {
      name: name.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      line1: line1.trim(),
      line2: line2 ? line2.trim() : "",
      city: city.trim(),
      state: state.trim(),
      default: shouldBeDefault,
    };

    // Add address to user's addresses array
    user.addresses.push(newAddress);

    // Save user
    await user.save();

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
      totalAddresses: user.addresses.length,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSelectedAddress = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get address index from params or body (prefer params)
    const addressIndex =
      req.params.index !== undefined
        ? parseInt(req.params.index, 10)
        : parseInt(req.body.index, 10);

    if (isNaN(addressIndex) || addressIndex < 0) {
      return res.status(400).json({
        message: "Invalid address index. Please provide a valid index",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has addresses
    if (!user.addresses || user.addresses.length === 0) {
      return res.status(404).json({ message: "No addresses found" });
    }

    // Check if index is valid
    if (addressIndex >= user.addresses.length) {
      return res.status(404).json({
        message: `Address not found at index ${addressIndex}`,
      });
    }

    // Get the address to be deleted
    const addressToDelete = user.addresses[addressIndex];
    const wasDefault = addressToDelete.default === true;

    // Remove the address from the array
    user.addresses.splice(addressIndex, 1);

    // Mark addresses array as modified
    user.markModified("addresses");

    // Save user
    await user.save();

    return res.status(200).json({
      message: "Address deleted successfully",
      wasDefault: wasDefault,
      totalAddresses: user.addresses.length,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const markAddressDefault = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get address index from params or body (prefer params)
    const addressIndex =
      req.params.index !== undefined
        ? parseInt(req.params.index, 10)
        : parseInt(req.body.index, 10);

    if (isNaN(addressIndex) || addressIndex < 0) {
      return res.status(400).json({
        message: "Invalid address index. Please provide a valid index",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has addresses
    if (!user.addresses || user.addresses.length === 0) {
      return res.status(404).json({ message: "No addresses found" });
    }

    // Check if index is valid
    if (addressIndex >= user.addresses.length) {
      return res.status(404).json({
        message: `Address not found at index ${addressIndex}`,
      });
    }

    // Check if already default
    const targetAddress = user.addresses[addressIndex];
    if (targetAddress.default === true) {
      return res.status(200).json({
        message: "Address is already set as default",
        address: targetAddress,
      });
    }

    // Set all addresses to default: false
    user.addresses.forEach((addr) => {
      addr.default = false;
    });

    // Set the selected address to default: true
    targetAddress.default = true;

    // Mark addresses array as modified
    user.markModified("addresses");

    // Save user
    await user.save();

    return res.status(200).json({
      message: "Address marked as default successfully",
      address: targetAddress,
      totalAddresses: user.addresses.length,
    });
  } catch (error) {
    console.error("Error marking address as default:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllUserAddress = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user
    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all addresses
    let addresses = user.addresses || [];

    // Sort addresses: default addresses first, then others
    // Convert subdocuments to plain objects and sort
    const sortedAddresses = addresses
      .map((addr) => (addr.toObject ? addr.toObject() : { ...addr }))
      .sort((a, b) => {
        // Default addresses first (true comes before false)
        if (a.default === b.default) {
          return 0; // Keep original order for same default status
        }
        return a.default ? -1 : 1; // true (-1) comes before false (1)
      });

    return res.status(200).json({
      message: "Addresses retrieved successfully",
      addresses: sortedAddresses,
      count: sortedAddresses.length,
      hasDefault: sortedAddresses.some((addr) => addr.default === true),
    });
  } catch (error) {
    console.error("Error getting user addresses:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
