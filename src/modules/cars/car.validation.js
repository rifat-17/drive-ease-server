

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