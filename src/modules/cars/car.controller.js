


import { ObjectId } from "mongodb";
import { getCollection } from "../../config/db.js";
import validateCar from "./car.validation.js";


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
    const carsCollection = getCollection("cars");

    const cars = await carsCollection
      .find({
        status: "APPROVED",
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).send({
      success: true,
      message: "Cars fetched successfully.",
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