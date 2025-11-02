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
};

export type BloodRequest = {
  id: string;
  userId: string;
  patientName: string;
  bloodType: string;
  location: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  createdAt: Timestamp;
  notes?: string;
  contactPerson: string;
  contactPhone: string;
};

export type Donation = {
  id: string;
  donorId: string;
  requestId: string;
  donationDate: Timestamp;
  location: string;
};

export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
