export type TripStatus = "open" | "completed";

export type PilgrimageTrip = {
  id?: string;
  dates: string;
  title: string;
  departure: string;
  destinations: string[];
  organizer: string;
  description: string;
  contact: string;
  status: TripStatus;
  image_url: string | null;
};


