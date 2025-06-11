// // booking-total-calculator.util.ts
// import Booking from "../models/booking.model";
// import Service from "../models/service.model";
// import Inventory from "../models/inventory.model";
// import AppError from "../utils/AppError";

// export const calculateBookingTotal = async (bookingId: string) => {
//   const booking = await Booking.findById(bookingId)
//     .populate("service_id", "price")
//     .populate("usedInventory.item", "price");

//   if (!booking) {
//     throw new AppError("Booking not found", 404);
//   }

//   const servicePrice = (booking.service_id as any).price || 0;

//   const inventoryTotal = booking.usedInventory.reduce((sum, entry) => {
//     const itemPrice = (entry.item as any).price || 0;
//     return sum + itemPrice * entry.quantity;
//   }, 0);

//   const total = Number((servicePrice + inventoryTotal).toFixed(2));

//   return {
//     servicePrice,
//     inventoryTotal,
//     total,
//   };
// };

// booking-total-calculator.util.ts (updated to use Assign model)
import Booking from "../models/booking.model";
import Assign from "../models/assign.model";
import AppError from "../utils/AppError";

export const calculateBookingTotal = async (bookingId: string) => {
  const booking: any = await Booking.findById(bookingId).populate("service_id");
  // console.log("booking from total calculator", booking);
  if (!booking) throw new AppError("Booking not found", 404);

  const assign: any = await Assign.findOne({ booking_id: bookingId }).populate(
    "usedInventory.item"
  );
  // console.log("assign from total calculator", assign);
  if (!assign) throw new AppError("Assign not found for this booking", 404);

  const servicePrice = booking.service_id?.price || 0;

  const inventoryTotal: any = assign.usedInventory.reduce(
    (sum: any, entry: any) => {
      const itemPrice = entry.item?.price || 0;
      return sum + itemPrice * entry.quantity;
    },
    0
  );

  const total = Number((servicePrice + inventoryTotal).toFixed(2));

  return {
    servicePrice,
    inventoryTotal,
    total,
  };
};
