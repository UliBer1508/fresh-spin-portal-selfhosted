import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import TestPreview from "@/components/TestPreview";
import { useBookings, Booking } from "@/hooks/useBookings";

const Index = () => {
  return <TestPreview />;
};

export default Index;