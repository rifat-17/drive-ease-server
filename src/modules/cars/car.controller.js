


import { ObjectId } from "mongodb";
import { getCollection } from "../../config/db.js";
import validateCar, { validateCarUpdate } from "./car.validation.js";

// Escape special regex characters in search values
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//add car
export const addCar = async (req, res) => {
  try {
    const validationError = validateCar(req.body);

    if (validationError) {
      return res.status(400).send({
        success: false,
        message: validationError,
      });
    }

    const {
      brand,
      model,
      year,
      category,
      description,
      dailyRate,
      pickupLocation,
      transmission,
      fuelType,
      seats,
      images,
    } = req.body;

    const newCar = {
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      category,
      description: description.trim(),
      dailyRate: Number(dailyRate),
      pickupLocation: pickupLocation.trim(),
      transmission,
      fuelType,
      seats: Number(seats),
      images,

      // Set by the server, never by the client.
      ownerId: new ObjectId(req.user._id),
      status: "PENDING",
      isActive: true,
      createdAt: new Date(),
    };

    const carsCollection = getCollection("cars");
    const result = await carsCollection.insertOne(newCar);

    return res.status(201).send({
      success: true,
      message: "Car submitted successfully for approval.",
      data: {
        _id: result.insertedId,
        ...newCar,
      },
    });
  } catch (error) {
    console.error("Add car error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to add car.",
    });
  }
};



//get all cars 
export const getAllCars = async (req, res) => {
  try {
    const {
      search,
      brand,
      category,
      location,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = "1",
      limit = "10",
    } = req.query;

    // Validate price filters
    const isValidPrice = (value) =>
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0;

    if (minPrice !== undefined && !isValidPrice(minPrice)) {
      return res.status(400).send({
        success: false,
        message: "Invalid minimum price.",
      });
    }

    if (maxPrice !== undefined && !isValidPrice(maxPrice)) {
      return res.status(400).send({
        success: false,
        message: "Invalid maximum price.",
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).send({
        success: false,
        message: "Minimum price cannot exceed maximum price.",
      });
    }

    // Allowed sorting options
    const sortOptions = {
      newest: { createdAt: -1 },
      price_low: { dailyRate: 1 },
      price_high: { dailyRate: -1 },
    };

    if (!sortOptions[sortBy]) {
      return res.status(400).send({
        success: false,
        message: "Invalid sorting option.",
      });
    }

    // Validate pagination
    const currentPage = Number(page);
    const pageSize = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 50
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid page or limit. Page must be positive and limit must be between 1 and 50.",
      });
    }

    const skip = (currentPage - 1) * pageSize;


    // Build MongoDB filter
    const filter = {
      status: "APPROVED",
      isActive: true,
    };

    // Search by brand or model
    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        { brand: searchRegex },
        { model: searchRegex },
      ];
    }

    // Filter by brand
    if (typeof brand === "string" && brand.trim()) {
      filter.brand = new RegExp(escapeRegex(brand.trim()), "i");
    }

    // Filter by category
    if (typeof category === "string" && category.trim()) {
      filter.category = new RegExp(
        `^${escapeRegex(category.trim())}$`,
        "i"
      );
    }

    // Filter by pickup location
    if (typeof location === "string" && location.trim()) {
      filter.pickupLocation = new RegExp(
        escapeRegex(location.trim()),
        "i"
      );
    }

    // Filter by transmission
    if (typeof transmission === "string" && transmission.trim()) {
      filter.transmission = new RegExp(
        `^${escapeRegex(transmission.trim())}$`,
        "i"
      );
    }

    // Filter by fuel type
    if (typeof fuelType === "string" && fuelType.trim()) {
      filter.fuelType = new RegExp(
        `^${escapeRegex(fuelType.trim())}$`,
        "i"
      );
    }

    // Filter by daily rate
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.dailyRate = {};

      if (minPrice !== undefined) {
        filter.dailyRate.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.dailyRate.$lte = Number(maxPrice);
      }
    }

    const carsCollection = getCollection("cars");

    const totalCars = await carsCollection.countDocuments(filter);

    const cars = await carsCollection
      .find(filter)
      .sort(sortOptions[sortBy])
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalPages = Math.ceil(totalCars / pageSize);

    return res.status(200).send({
      success: true,
      message: "Cars fetched successfully.",
      pagination: {
        totalCars,
        totalPages,
        currentPage,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      results: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Get all cars error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to fetch cars.",
    });
  }
};




// id 
export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID.",
      });
    }

    const carsCollection = getCollection("cars");

    const car = await carsCollection.findOne({
      _id: new ObjectId(id),
      status: "APPROVED",
      isActive: true,
    });

    if (!car) {
      return res.status(404).send({
        success: false,
        message: "Car not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Car fetched successfully.",
      data: car,
    });
  } catch (error) {
    console.error("Get car by ID error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to fetch car.",
    });
  }
};



// get My Cars
export const getMyCars = async (req, res) => {
  try {
    const carsCollection = getCollection("cars");

    const cars = await carsCollection
      .find({
        ownerId: new ObjectId(req.user._id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).send({
      success: true,
      message: "Your cars fetched successfully.",
      results: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Get my cars error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to fetch your cars.",
    });
  }
};


// update car
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID.",
      });
    }

    // Validate update data
    const validationError = validateCarUpdate(req.body);

    if (validationError) {
      return res.status(400).send({
        success: false,
        message: validationError,
      });
    }

    const carsCollection = getCollection("cars");

    // Find car belonging to the logged-in owner
    const existingCar = await carsCollection.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(req.user._id),
    });

    if (!existingCar) {
      return res.status(404).send({
        success: false,
        message: "Car not found or you are not the owner.",
      });
    }

    // Prepare only the fields allowed to be updated
    const updatedData = { ...req.body };

    // Convert numeric fields
    if (updatedData.year !== undefined) {
      updatedData.year = Number(updatedData.year);
    }

    if (updatedData.dailyRate !== undefined) {
      updatedData.dailyRate = Number(updatedData.dailyRate);
    }

    if (updatedData.seats !== undefined) {
      updatedData.seats = Number(updatedData.seats);
    }

    // Trim string fields
    for (const field of [
      "brand",
      "model",
      "category",
      "description",
      "pickupLocation",
      "transmission",
      "fuelType",
    ]) {
      if (updatedData[field] !== undefined) {
        updatedData[field] = updatedData[field].trim();
      }
    }

    // Update car and send it back to admin review
    const result = await carsCollection.updateOne(
      {
        _id: new ObjectId(id),
        ownerId: new ObjectId(req.user._id),
      },
      {
        $set: {
          ...updatedData,
          status: "PENDING",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Car not found.",
      });
    }

    const updatedCar = await carsCollection.findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).send({
      success: true,
      message: "Car updated successfully and submitted for approval.",
      data: updatedCar,
    });
  } catch (error) {
    console.error("Update car error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to update car.",
    });
  }
};



//delete cars
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid car ID.",
      });
    }

    const carsCollection = getCollection("cars");

    // Find the car belonging to the logged-in owner
    const car = await carsCollection.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(req.user._id),
      isActive: true,
    });

    if (!car) {
      return res.status(404).send({
        success: false,
        message: "Car not found or already deleted.",
      });
    }

    // Soft delete
    await carsCollection.updateOne(
      {
        _id: new ObjectId(id),
        ownerId: new ObjectId(req.user._id),
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).send({
      success: true,
      message: "Car deleted successfully.",
    });
  } catch (error) {
    console.error("Delete car error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to delete car.",
    });
  }
};
