import { createContext, useContext, ReactNode } from "react";
import { useBookings, Booking, LinenOrder } from "@/hooks/useBookings";

type BookingsCtx = {
  bookings: Booking[];
  standaloneOrders: LinenOrder[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  refetch: () => void;
};

const Ctx = createContext<BookingsCtx | null>(null);

export const BookingsProvider = ({
  children,
  onNewOrder,
}: {
  children: ReactNode;
  onNewOrder?: () => void;
}) => {
  const value = useBookings(onNewOrder);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useBookingsContext = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBookingsContext must be used inside BookingsProvider");
  return ctx;
};
