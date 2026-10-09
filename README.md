# ONEcainTAP - Digital Barangay Service Management System

**Municipality of Cainta, Rizal, Philippines**

A modern, mobile-first Progressive Web App (PWA) for managing barangay service requests including certificates, clearances, and indigency documents.

## Features

- 📋 **Certificate Requests**: Barangay Clearance, Certificate of Residency, Barangay Indigency, Certificate of Indigency, Business Clearance
- 👤 **Resident Portal**: User registration, certificate request form, real-time request tracking
- 👨‍💼 **Admin Panel**: Request review, approval/rejection workflow, certificate generation
- 🔐 **Authentication**: Secure sign-in, OTP-based password reset
- 📱 **PWA**: Installable on mobile devices, offline-capable
- 📊 **Dashboard**: Statistics, request status overview, recent activity

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA**: Service Worker, Web App Manifest
- **Storage**: localStorage (simulated database)
- **Style**: Custom CSS with mobile-first responsive design

## Getting Started

### Local Development

```bash
# Navigate to project directory
cd C:\Users\mamar\Downloads\onecainta

# Open index.html directly in your browser
# Or use a local server (recommended for Service Worker)
npx serve .
```

### Using live-server

```bash
npm install -g live-server
live-server
```

Then open `http://127.0.0.1:5500`

## Credentials (Demo)

### Admin Access
- **Email**: admin@cainta.gov.ph
- **Password**: admin123

### Demo Resident Access
- **Email**: juan@email.com
- **Password**: password123

## Screens

1. **Splash Screen** - App branding and navigation
2. **Sign In / Sign Up** - Authentication
3. **Resident Dashboard** - Quick actions, recent requests
4. **Certificate Selection** - Choose document type
5. **Request Form** - Submit certificate request
6. **Request Detail** - Track progress and download certificates
7. **Admin Dashboard** - Review and manage requests
8. **Admin Review** - Approve/reject requests

## Data Storage

The system uses localStorage to simulate a database:
- `oct_users` - Registered users and residents
- `oct_requests` - Certificate requests and their status
- `oct_session` - Active user sessions
- `oct_counter` - Request number counter

## Certificate Types

- **Barangay Clearance** - General purpose clearance for residency
- **Certificate of Residency** - Proof of address and residence
- **Barangay Indigency** - For low-income assistance programs
- **Certificate of Indigency** - Financial assistance certification
- **Business Clearance** - For business permit applications

## Requirements Tracking

Requests have the following status flow:
1. **Pending** - Request submitted, awaiting review
2. **Approving** - Under review by admin
3. **Approved** - Approved, ready for pickup/delivery
4. **Rejected** - Rejected with remarks
5. **Ready** - Certificate available for download

## License

Developed for Municipality of Cainta, Rizal under open source terms.

## Contributing

This is a demo/prototype system. For production use, additional security measures and backend integration will be required.