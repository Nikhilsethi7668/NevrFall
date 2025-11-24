import WarehouseLocation from "../../Models/WarehouseLocation.js";

export const addNewWarehouseLocation = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const {
      name,
      phone,
      pincode,
      line1,
      line2,
      city,
      state,
      isDefault = false,
    } = req.body;

    // Validate inputs
    if (
      !name?.trim() ||
      !phone?.trim() ||
      !pincode?.trim() ||
      !line1?.trim() ||
      !line2?.trim() ||
      !city?.trim() ||
      !state?.trim()
    ) {
      return res
        .status(400)
        .json({ message: "All input fields are required." });
    }

    // If setting as default, set all other warehouses to non-default
    if (isDefault === true) {
      await WarehouseLocation.updateMany({}, { $set: { default: false } });
    }

    // Create new address
    const address = await WarehouseLocation.create({
      name: name.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      default: isDefault === true,
    });

    return res.status(201).json({
      message: "Warehouse location added successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all warehouse locations
export const getAllWarehouseLocations = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const locations = await WarehouseLocation.find({})
      .sort({ default: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Warehouse locations retrieved successfully",
      data: locations,
      count: locations.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update warehouse address
export const updateWarehouseAddress = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { name, phone, pincode, line1, line2, city, state, isDefault } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Warehouse ID is required" });
    }

    const warehouse = await WarehouseLocation.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse location not found" });
    }

    // Update fields if provided
    if (name?.trim()) warehouse.name = name.trim();
    if (phone?.trim()) warehouse.phone = phone.trim();
    if (pincode?.trim()) warehouse.pincode = pincode.trim();
    if (line1?.trim()) warehouse.line1 = line1.trim();
    if (line2 !== undefined) warehouse.line2 = line2?.trim() || "";
    if (city?.trim()) warehouse.city = city.trim();
    if (state?.trim()) warehouse.state = state.trim();

    // Handle default flag
    if (isDefault === true) {
      // Set all other warehouses to non-default
      await WarehouseLocation.updateMany(
        { _id: { $ne: id } },
        { $set: { default: false } }
      );
      warehouse.default = true;
    } else if (isDefault === false) {
      warehouse.default = false;
    }

    await warehouse.save();

    return res.status(200).json({
      message: "Warehouse location updated successfully",
      data: warehouse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Warehouse Address
export const deleteWarehouseAddress = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Warehouse ID is required" });
    }

    const warehouse = await WarehouseLocation.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse location not found" });
    }

    await WarehouseLocation.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Warehouse location deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Set Default Warehouse Address
export const setDefaultWarehouseAddress = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Warehouse ID is required" });
    }

    const warehouse = await WarehouseLocation.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse location not found" });
    }

    if (warehouse.default === true) {
      return res.status(200).json({
        message: "Warehouse location is already set as default",
        data: warehouse,
      });
    }

    // Set all other warehouses to non-default
    await WarehouseLocation.updateMany(
      { _id: { $ne: id } },
      { $set: { default: false } }
    );

    // Set this warehouse as default
    warehouse.default = true;
    await warehouse.save();

    return res.status(200).json({
      message: "Warehouse location set as default successfully",
      data: warehouse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Unset Default Warehouse Address
export const unsetDefaultWarehouseAddress = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Warehouse ID is required" });
    }

    const warehouse = await WarehouseLocation.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse location not found" });
    }

    if (warehouse.default === false) {
      return res.status(200).json({
        message: "Warehouse location is already not default",
        data: warehouse,
      });
    }

    warehouse.default = false;
    await warehouse.save();

    return res.status(200).json({
      message: "Warehouse location unset as default successfully",
      data: warehouse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
