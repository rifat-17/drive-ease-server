

const validateCar = (data) => {
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
  } = data;

  if (
    !brand ||
    !model ||
    !year ||
    !category ||
    !description ||
    !dailyRate ||
    !pickupLocation ||
    !transmission ||
    !fuelType ||
    !seats ||
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return "All required car fields must be provided.";
  }

  if (typeof brand !== "string" || typeof model !== "string") {
    return "Brand and model must be strings.";
  }

  if (!Number.isInteger(Number(year)) || Number(year) < 1900) {
    return "Please provide a valid car year.";
  }

  if (!Number.isFinite(Number(dailyRate)) || Number(dailyRate) <= 0) {
    return "Daily rate must be greater than zero.";
  }

  if (!Number.isInteger(Number(seats)) || Number(seats) <= 0) {
    return "Please provide a valid seat count.";
  }

  if (images.some((image) => typeof image !== "string" || !image.trim())) {
    return "Images must contain valid image URLs.";
  }

  return null;
};

export default validateCar;



// validate car updat
export const validateCarUpdate = (data) => {
  const allowedFields = [
    "brand",
    "model",
    "year",
    "category",
    "description",
    "dailyRate",
    "pickupLocation",
    "transmission",
    "fuelType",
    "seats",
    "images",
  ];

  const fields = Object.keys(data);

  if (fields.length === 0) {
    return "Please provide at least one field to update.";
  }

  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return `Invalid fields: ${invalidFields.join(", ")}`;
  }

  for (const field of fields) {
    const value = data[field];

    if (value === undefined || value === null) {
      return `${field} cannot be empty.`;
    }

    if (
      ["brand", "model", "category", "description",
        "pickupLocation", "transmission", "fuelType"].includes(field)
    ) {
      if (typeof value !== "string" || !value.trim()) {
        return `${field} must be a non-empty string.`;
      }
    }

    if (field === "year") {
      if (!Number.isInteger(Number(value)) || Number(value) < 1900) {
        return "Please provide a valid car year.";
      }
    }

    if (field === "dailyRate") {
      if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
        return "Daily rate must be greater than zero.";
      }
    }

    if (field === "seats") {
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
        return "Please provide a valid seat count.";
      }
    }

    if (field === "images") {
      if (
        !Array.isArray(value) ||
        value.length === 0 ||
        value.some((image) => typeof image !== "string" || !image.trim())
      ) {
        return "Please provide valid car images.";
      }
    }
  }

  return null;
};
