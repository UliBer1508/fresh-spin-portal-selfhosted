import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import { useBookings, Booking } from "@/hooks/useBookings";

const Index = () => {
  console.log("Index component rendering");
  
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <div className="bg-white p-4 rounded">
        <h1 className="text-2xl font-bold text-black">
          Test - App funktioniert!
        </h1>
        <p className="text-gray-600 mt-2">
          Wenn Sie das sehen, lädt die App grundsätzlich.
        </p>
      </div>
    </div>
  );
};

export default Index;