import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinenSetDefinition {
  house_id: string;
  custom_categories: Record<string, {
    color?: string;
    quantity?: number;
    enabled?: boolean;
  }>;
}

interface Booking {
  id: string;
  house_id: string;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  status: string;
}

interface House {
  id: string;
  name: string;
  default_linen_color: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting check-booking-linen-orders function...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get lookahead configuration (default 3 days)
    const { data: configData } = await supabase
      .from('booking_linen_config')
      .select('lookahead_bookings, warning_days_before')
      .limit(1)
      .single();

    const lookaheadDays = configData?.lookahead_bookings || 3;
    console.log(`Using lookahead of ${lookaheadDays} days`);

    // Calculate date range
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + lookaheadDays);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    console.log(`Checking bookings from ${todayStr} to ${futureDateStr}`);

    // Get all bookings in the lookahead period that don't have cancelled status
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, house_id, check_in, check_out, number_of_guests, status')
      .gte('check_in', todayStr)
      .lte('check_in', futureDateStr)
      .not('status', 'eq', 'cancelled');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} bookings in lookahead period`);

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No bookings to process', ordersCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing linen orders for these bookings
    const bookingIds = bookings.map(b => b.id);
    const { data: existingOrders, error: ordersError } = await supabase
      .from('linen_orders')
      .select('booking_id')
      .in('booking_id', bookingIds);

    if (ordersError) {
      console.error('Error fetching existing orders:', ordersError);
      throw ordersError;
    }

    const existingBookingIds = new Set(existingOrders?.map(o => o.booking_id) || []);
    console.log(`Found ${existingBookingIds.size} existing orders`);

    // Filter bookings that don't have orders yet
    const bookingsNeedingOrders = bookings.filter(b => !existingBookingIds.has(b.id));
    console.log(`${bookingsNeedingOrders.length} bookings need orders`);

    if (bookingsNeedingOrders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All bookings already have orders', ordersCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get house IDs for lookups
    const houseIds = [...new Set(bookingsNeedingOrders.map(b => b.house_id))];

    // Fetch houses and linen set definitions in parallel
    const [housesResult, linenSettingsResult] = await Promise.all([
      supabase.from('houses').select('id, name, default_linen_color').in('id', houseIds),
      supabase.from('linen_set_definitions').select('house_id, custom_categories').in('house_id', houseIds)
    ]);

    if (housesResult.error) {
      console.error('Error fetching houses:', housesResult.error);
      throw housesResult.error;
    }

    // Create lookup maps
    const housesMap = new Map<string, House>(
      (housesResult.data || []).map(h => [h.id, h])
    );
    
    const linenSettingsMap = new Map<string, LinenSetDefinition>(
      (linenSettingsResult.data || []).map(ls => [ls.house_id, ls])
    );

    console.log(`Loaded ${housesMap.size} houses and ${linenSettingsMap.size} linen settings`);

    // Create orders for each booking
    const ordersToCreate = [];

    for (const booking of bookingsNeedingOrders) {
      const house = housesMap.get(booking.house_id);
      const linenSettings = linenSettingsMap.get(booking.house_id);

      if (!house) {
        console.warn(`House not found for booking ${booking.id}`);
        continue;
      }

      // Extract item_variants from custom_categories
      const itemVariants: Record<string, string> = {};
      const items: Record<string, number> = {};

      if (linenSettings?.custom_categories) {
        const categories = linenSettings.custom_categories as Record<string, {
          color?: string;
          quantity?: number;
          enabled?: boolean;
        }>;

        for (const [itemKey, config] of Object.entries(categories)) {
          // Only include enabled items with quantity > 0
          if (config.enabled !== false && config.quantity && config.quantity > 0) {
            items[itemKey] = config.quantity;
            
            // Set the color for this item if defined
            if (config.color) {
              itemVariants[itemKey] = config.color;
              console.log(`Setting ${itemKey} color to ${config.color} for ${house.name}`);
            }
          }
        }
      }

      // Calculate delivery date (1 day before check-in)
      const checkInDate = new Date(booking.check_in);
      const deliveryDate = new Date(checkInDate);
      deliveryDate.setDate(deliveryDate.getDate() - 1);
      const deliveryDateStr = deliveryDate.toISOString().split('T')[0];

      const order = {
        house_id: booking.house_id,
        booking_id: booking.id,
        items: Object.keys(items).length > 0 ? items : null,
        item_variants: Object.keys(itemVariants).length > 0 ? itemVariants : null,
        linen_color: null, // No longer using global color, using item_variants instead
        delivery_date: deliveryDateStr,
        delivery_type: 'delivery',
        status: 'pending',
        order_source: 'auto_booking_lookahead',
        notes: `Automatisch erstellt für Buchung am ${booking.check_in}`
      };

      console.log(`Creating order for ${house.name}: items=${JSON.stringify(items)}, variants=${JSON.stringify(itemVariants)}`);
      ordersToCreate.push(order);
    }

    // Insert all orders
    if (ordersToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('linen_orders')
        .insert(ordersToCreate);

      if (insertError) {
        console.error('Error inserting orders:', insertError);
        throw insertError;
      }

      console.log(`Successfully created ${ordersToCreate.length} orders`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${ordersToCreate.length} linen orders`,
        ordersCreated: ordersToCreate.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-booking-linen-orders:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
