-- Track whether admin has seen a booking request
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS seen BOOLEAN NOT NULL DEFAULT false;
