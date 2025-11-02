import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'donor' | 'patient' | 'admin';
  bloodType: string;
  // Location can be a simple string for display, but we also store structured geo data
  location: string; 
  geohash?: string;
  lat?: number;
  lng?: number;
  availability: 'Available' | 'Unavailable';
  lastDonationDate: string | null;
  healthConditions?: string;
  avatarUrl?: string;
  isDonor: boolean;
  phoneNumber?: string;
};

export type BloodRequest = {
  id: string;
  userId: string;
  patientName: string;
  bloodType: string;
  location: string;
  geohash?: string;
  lat?: number;
  lng?: number;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Matched' | 'Fulfilled' | 'Cancelled';
  createdAt: Timestamp;
  notes?: string;
  contactPerson: string;
  contactPhone: string;
};

export type DonationMatch = {
    id: string;
    requestId: string;
    requestUserId: string; // ID of the user who made the request
    donorId: string;
    donorName: string;
    donorLocation: string;
    donorBloodType: string;
    donorContactPhone?: string;
    matchDate: Timestamp;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
};

export type Notification = {
    id: string;
    userId: string; // User who receives the notification
    message: string;
    type: 'request_match' | 'offer_accepted' | 'offer_rejected';
    relatedId: string; // ID of the request or match
    isRead: boolean;
    createdAt: Timestamp;
}


export type Donation = {
  id: string;
  donorId: string;
  requestId?: string; // Optional: Link to the specific request fulfilled
  donorName: string;
  bloodType: string;
  location: string;
  donationDate: Timestamp;
};


export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
