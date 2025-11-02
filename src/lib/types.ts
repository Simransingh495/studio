import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string; // Ensured this is part of the user type
  role: 'donor' | 'patient' | 'admin';
  bloodType: string;
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
  geohash?: string;
  lat?: number;
  lng?: number;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  createdAt: Timestamp;
  notes?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
};

export type DonationMatch = {
    id: string;
    requestId: string;
    requestUserId: string; 
    donorId: string;
    donorName: string;
    donorLocation: string;
    donorBloodType: string;
    donorEmail: string;
    donorPhoneNumber: string;
    matchDate: Timestamp;
    status: 'pending' | 'accepted' | 'rejected';
};

export type Notification = {
    id: string;
    userId: string; 
    message: string;
    type: 'request_match' | 'offer_accepted' | 'offer_rejected';
    relatedId: string; 
    isRead: boolean;
    createdAt: Timestamp;
}


export type Donation = {
  id: string;
  donorId: string;
  requestId?: string; 
  donorName: string;
  bloodType: string;
  location: string;
  donationDate: Date;
};


export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
