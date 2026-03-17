-- Fix booking/check-in failures caused by mixed listing ID formats.
-- New listing tables use TEXT ids, but bookings/availability still used UUID item_id.
-- This migration converts item_id to TEXT, safely backfills missing bookings, rebuilds availability,
-- and restores host policies/triggers/view.

DROP VIEW IF EXISTS public.creator_booking_summary;

DROP TRIGGER IF EXISTS trg_validate_booking_capacity ON public.bookings;
DROP TRIGGER IF EXISTS trg_bookings_availability_change ON public.bookings;

DROP POLICY IF EXISTS "Hosts can update bookings for their items" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their items" ON public.bookings;

ALTER TABLE public.bookings
ALTER COLUMN item_id TYPE text
USING item_id::text;

ALTER TABLE public.item_availability_by_date
ALTER COLUMN item_id TYPE text
USING item_id::text;

ALTER TABLE public.item_availability_overall
ALTER COLUMN item_id TYPE text
USING item_id::text;

DROP FUNCTION IF EXISTS public.get_date_availability(uuid, text, date);
CREATE OR REPLACE FUNCTION public.get_date_availability(p_item_id text, p_item_type text, p_date date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_capacity integer;
  v_booked_slots integer;
BEGIN
  IF p_item_type IN ('trip', 'event') THEN
    SELECT available_tickets INTO v_total_capacity
    FROM public.trips
    WHERE id = p_item_id;
  ELSIF p_item_type = 'hotel' THEN
    SELECT available_rooms INTO v_total_capacity
    FROM public.hotels
    WHERE id = p_item_id;
  ELSIF p_item_type IN ('adventure', 'adventure_place') THEN
    SELECT available_slots INTO v_total_capacity
    FROM public.adventure_places
    WHERE id = p_item_id;
  ELSE
    RETURN jsonb_build_object('error', 'Invalid item type');
  END IF;

  SELECT COALESCE(SUM(slots_booked), 0)
  INTO v_booked_slots
  FROM public.bookings
  WHERE item_id = p_item_id
    AND visit_date = p_date
    AND status NOT IN ('cancelled', 'rejected');

  RETURN jsonb_build_object(
    'total_capacity', v_total_capacity,
    'booked_slots', v_booked_slots,
    'available_slots', GREATEST(0, COALESCE(v_total_capacity, 0) - v_booked_slots),
    'availability_status',
      CASE
        WHEN COALESCE(v_total_capacity, 0) <= 0 THEN 'fully_booked'
        WHEN (COALESCE(v_total_capacity, 0) - v_booked_slots) <= 0 THEN 'fully_booked'
        WHEN v_total_capacity > 0 AND v_booked_slots::float / v_total_capacity > 0.7 THEN 'partially_booked'
        ELSE 'available'
      END
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.recompute_item_availability_by_date(uuid, date);
CREATE OR REPLACE FUNCTION public.recompute_item_availability_by_date(p_item_id text, p_visit_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total integer;
BEGIN
  IF p_item_id IS NULL OR p_visit_date IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(COALESCE(b.slots_booked, 1)), 0)
  INTO v_total
  FROM public.bookings b
  WHERE b.item_id = p_item_id
    AND b.visit_date = p_visit_date
    AND b.status NOT IN ('cancelled', 'rejected')
    AND COALESCE(b.payment_status, 'pending') <> 'failed';

  INSERT INTO public.item_availability_by_date (item_id, visit_date, booked_slots, updated_at)
  VALUES (p_item_id, p_visit_date, v_total, now())
  ON CONFLICT (item_id, visit_date)
  DO UPDATE SET booked_slots = excluded.booked_slots, updated_at = excluded.updated_at;
END;
$function$;

DROP FUNCTION IF EXISTS public.recompute_item_availability_overall(uuid);
CREATE OR REPLACE FUNCTION public.recompute_item_availability_overall(p_item_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total integer;
BEGIN
  IF p_item_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(COALESCE(b.slots_booked, 1)), 0)
  INTO v_total
  FROM public.bookings b
  WHERE b.item_id = p_item_id
    AND b.status NOT IN ('cancelled', 'rejected')
    AND COALESCE(b.payment_status, 'pending') <> 'failed';

  INSERT INTO public.item_availability_overall (item_id, booked_slots, updated_at)
  VALUES (p_item_id, v_total, now())
  ON CONFLICT (item_id)
  DO UPDATE SET booked_slots = excluded.booked_slots, updated_at = excluded.updated_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_booking_availability_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recompute_item_availability_by_date(new.item_id, new.visit_date);
    PERFORM public.recompute_item_availability_overall(new.item_id);
    RETURN new;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_item_availability_by_date(old.item_id, old.visit_date);
    PERFORM public.recompute_item_availability_overall(old.item_id);
    RETURN old;
  ELSE
    PERFORM public.recompute_item_availability_by_date(new.item_id, new.visit_date);
    PERFORM public.recompute_item_availability_overall(new.item_id);

    IF old.item_id IS DISTINCT FROM new.item_id OR old.visit_date IS DISTINCT FROM new.visit_date THEN
      PERFORM public.recompute_item_availability_by_date(old.item_id, old.visit_date);
      PERFORM public.recompute_item_availability_overall(old.item_id);
    END IF;

    RETURN new;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_capacity integer;
  v_already integer;
  v_request integer;
BEGIN
  IF new.status IN ('cancelled', 'rejected') THEN
    RETURN new;
  END IF;
  IF COALESCE(new.payment_status, 'pending') = 'failed' THEN
    RETURN new;
  END IF;

  IF new.booking_type = 'hotel' AND new.visit_date IS NULL THEN
    RAISE EXCEPTION 'Visit date is required for hotel bookings.';
  END IF;

  IF new.booking_type IN ('trip', 'event') THEN
    SELECT COALESCE(t.available_tickets, 0) INTO v_capacity
    FROM public.trips t
    WHERE t.id = new.item_id;
  ELSIF new.booking_type = 'hotel' THEN
    SELECT COALESCE(h.available_rooms, 0) INTO v_capacity
    FROM public.hotels h
    WHERE h.id = new.item_id;
  ELSIF new.booking_type IN ('adventure', 'adventure_place') THEN
    SELECT COALESCE(a.available_slots, 0) INTO v_capacity
    FROM public.adventure_places a
    WHERE a.id = new.item_id;
  ELSE
    RETURN new;
  END IF;

  IF v_capacity IS NULL OR v_capacity <= 0 THEN
    RAISE EXCEPTION 'This item is not available for booking.';
  END IF;

  v_request := GREATEST(COALESCE(new.slots_booked, 1), 1);

  SELECT COALESCE(SUM(COALESCE(b.slots_booked, 1)), 0)
  INTO v_already
  FROM public.bookings b
  WHERE b.item_id = new.item_id
    AND b.id <> COALESCE(new.id, '00000000-0000-0000-0000-000000000000')::uuid
    AND (b.visit_date = new.visit_date OR (b.visit_date IS NULL AND new.visit_date IS NULL))
    AND b.status NOT IN ('cancelled', 'rejected')
    AND COALESCE(b.payment_status, 'pending') <> 'failed';

  IF (v_already + v_request) > v_capacity THEN
    RAISE EXCEPTION 'Sold out for the selected date. Please choose another date.';
  END IF;

  RETURN new;
END;
$function$;

ALTER TABLE public.bookings DISABLE TRIGGER USER;

INSERT INTO public.bookings (
  user_id,
  item_id,
  booking_type,
  total_amount,
  status,
  payment_status,
  payment_method,
  is_guest_booking,
  guest_name,
  guest_email,
  guest_phone,
  slots_booked,
  visit_date,
  booking_details,
  service_fee_amount,
  host_payout_amount,
  payout_status,
  payout_scheduled_at,
  referral_tracking_id,
  created_at,
  updated_at
)
SELECT
  CASE WHEN NULLIF(p.booking_data ->> 'user_id', '') IS NOT NULL THEN (p.booking_data ->> 'user_id')::uuid ELSE NULL END,
  p.booking_data ->> 'item_id',
  p.booking_data ->> 'booking_type',
  COALESCE((p.booking_data ->> 'total_amount')::numeric, p.amount),
  'confirmed',
  'completed',
  'card',
  COALESCE((p.booking_data ->> 'is_guest_booking')::boolean, false),
  p.booking_data ->> 'guest_name',
  p.booking_data ->> 'guest_email',
  p.booking_data ->> 'guest_phone',
  COALESCE((p.booking_data ->> 'slots_booked')::integer, 1),
  CASE WHEN NULLIF(p.booking_data ->> 'visit_date', '') IS NOT NULL THEN (p.booking_data ->> 'visit_date')::date ELSE NULL END,
  COALESCE(p.booking_data -> 'booking_details', '{}'::jsonb),
  0,
  0,
  'scheduled',
  CASE
    WHEN NULLIF(p.booking_data ->> 'visit_date', '') IS NOT NULL THEN (((p.booking_data ->> 'visit_date')::timestamp) - interval '48 hours')
    ELSE NULL
  END,
  CASE
    WHEN NULLIF(p.booking_data ->> 'referral_tracking_id', '') IS NOT NULL THEN (p.booking_data ->> 'referral_tracking_id')::uuid
    ELSE NULL
  END,
  p.created_at,
  now()
FROM public.payments p
WHERE p.payment_status = 'completed'
  AND p.booking_data IS NOT NULL
  AND NULLIF(p.booking_data ->> 'item_id', '') IS NOT NULL
  AND NULLIF(p.booking_data ->> 'booking_type', '') IS NOT NULL
  AND NULLIF(p.booking_data ->> 'guest_email', '') IS NOT NULL
  AND (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = p.booking_data ->> 'item_id')
    OR EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = p.booking_data ->> 'item_id')
    OR EXISTS (SELECT 1 FROM public.adventure_places a WHERE a.id = p.booking_data ->> 'item_id')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.item_id = (p.booking_data ->> 'item_id')
      AND COALESCE(b.guest_email, '') = COALESCE(p.booking_data ->> 'guest_email', '')
      AND COALESCE(b.visit_date::text, '') = COALESCE(p.booking_data ->> 'visit_date', '')
      AND b.created_at >= (p.created_at - interval '5 minutes')
      AND b.created_at <= (p.created_at + interval '5 minutes')
  );

TRUNCATE TABLE public.item_availability_by_date;
TRUNCATE TABLE public.item_availability_overall;

INSERT INTO public.item_availability_by_date (item_id, visit_date, booked_slots, updated_at)
SELECT
  b.item_id,
  b.visit_date,
  COALESCE(SUM(COALESCE(b.slots_booked, 1)), 0),
  now()
FROM public.bookings b
WHERE b.visit_date IS NOT NULL
  AND b.status NOT IN ('cancelled', 'rejected')
  AND COALESCE(b.payment_status, 'pending') <> 'failed'
GROUP BY b.item_id, b.visit_date;

INSERT INTO public.item_availability_overall (item_id, booked_slots, updated_at)
SELECT
  b.item_id,
  COALESCE(SUM(COALESCE(b.slots_booked, 1)), 0),
  now()
FROM public.bookings b
WHERE b.status NOT IN ('cancelled', 'rejected')
  AND COALESCE(b.payment_status, 'pending') <> 'failed'
GROUP BY b.item_id;

ALTER TABLE public.bookings ENABLE TRIGGER USER;

CREATE TRIGGER trg_validate_booking_capacity
BEFORE INSERT OR UPDATE OF item_id, visit_date, slots_booked, status, payment_status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_capacity();

CREATE TRIGGER trg_bookings_availability_change
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_booking_availability_change();

CREATE POLICY "Hosts can update bookings for their items"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  item_id IN (
    SELECT trips.id FROM public.trips WHERE trips.created_by = auth.uid()
    UNION
    SELECT hotels.id FROM public.hotels WHERE hotels.created_by = auth.uid()
    UNION
    SELECT adventure_places.id FROM public.adventure_places WHERE adventure_places.created_by = auth.uid()
  )
)
WITH CHECK (
  item_id IN (
    SELECT trips.id FROM public.trips WHERE trips.created_by = auth.uid()
    UNION
    SELECT hotels.id FROM public.hotels WHERE hotels.created_by = auth.uid()
    UNION
    SELECT adventure_places.id FROM public.adventure_places WHERE adventure_places.created_by = auth.uid()
  )
);

CREATE POLICY "Hosts can view bookings for their items"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  item_id IN (
    SELECT trips.id FROM public.trips WHERE trips.created_by = auth.uid()
    UNION
    SELECT hotels.id FROM public.hotels WHERE hotels.created_by = auth.uid()
    UNION
    SELECT adventure_places.id FROM public.adventure_places WHERE adventure_places.created_by = auth.uid()
  )
);

CREATE VIEW public.creator_booking_summary
WITH (security_invoker=on) AS
SELECT
  b.booking_details,
  b.booking_type,
  b.created_at,
  CASE
    WHEN b.guest_email IS NULL OR b.guest_email = '' THEN NULL
    WHEN position('@' in b.guest_email) <= 2 THEN b.guest_email
    ELSE left(b.guest_email, 2) || '***' || substring(b.guest_email from position('@' in b.guest_email))
  END AS guest_email_limited,
  CASE
    WHEN b.guest_name IS NULL OR b.guest_name = '' THEN 'Guest'
    ELSE left(b.guest_name, 1) || repeat('*', greatest(length(b.guest_name) - 1, 0))
  END AS guest_name_masked,
  CASE
    WHEN b.guest_phone IS NULL OR b.guest_phone = '' THEN NULL
    WHEN length(b.guest_phone) <= 4 THEN b.guest_phone
    ELSE repeat('*', greatest(length(b.guest_phone) - 4, 0)) || right(b.guest_phone, 4)
  END AS guest_phone_limited,
  b.id,
  b.is_guest_booking,
  b.item_id,
  b.payment_method,
  b.payment_status,
  b.slots_booked,
  b.status,
  b.total_amount,
  b.updated_at,
  b.user_id
FROM public.bookings b;