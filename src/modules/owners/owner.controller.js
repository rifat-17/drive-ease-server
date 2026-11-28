

import { getCollection } from "../../config/db.js";

// Get owner dashboard statistics
export const getOwnerOverview = async (req, res) => {
  try {
    const carsCollection = getCollection("cars");
    const rentalsCollection = getCollection("rentals");
    const usersCollection = getCollection("users");

    const ownerId = req.user._id;

    // Get all owner cars
    const totalCars = await carsCollection.countDocuments({
      ownerId,
    });

    // Get approved and active cars
    const availableCars = await carsCollection.countDocuments({
      ownerId,
      status: "APPROVED",
      isActive: true,
    });

    // Get rental statistics
    const rentalStats = await rentalsCollection.aggregate([
      {
        $match: { ownerId },
      },
      {
        $group: {
          _id: "$status",

          count: { $sum: 1 },

          earnings: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                "$totalPrice",
                0,
              ],
            },
          },
        },
      },
    ]).toArray();

    const pendingRequests =
      rentalStats.find((item) => item._id === "PENDING")?.count || 0;

    const acceptedRentals =
      rentalStats.find((item) => item._id === "ACCEPTED")?.count || 0;

    const completedRentals =
      rentalStats.find((item) => item._id === "COMPLETED")?.count || 0;

    const totalEarnings = rentalStats.reduce(
      (total, item) => total + item.earnings,
      0
    );

    // Get owner subscription
    const owner = await usersCollection.findOne(
      { _id: ownerId },
      { projection: { subscriptionPlan: 1 } }
    );

    return res.status(200).json({
      success: true,
      data: {
        totalCars,
        availableCars,
        pendingRequests,
        acceptedRentals,
        completedRentals,
        totalEarnings,
        subscriptionPlan: owner?.subscriptionPlan || "FREE",
      },
    });
  } catch (error) {
    console.error("Owner overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load owner dashboard statistics.",
    });
  }
};
