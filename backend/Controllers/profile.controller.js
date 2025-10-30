import User from "../Models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ user });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true }
    );
    return res.json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const walletHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ walletHistory });
  } catch (error) {
    console.error("Error getting wallet history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};