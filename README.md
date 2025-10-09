Ride Booking API

🚖 A secure, scalable, and role-based backend API for a ride booking system (like Uber/Pathao) built with Express.js, Mongoose, and TypeScript.

Table of Contents

Project Overview

Features

Technologies

Installation & Setup

Environment Variables

API Endpoints

Authentication

Rider Endpoints

Driver Endpoints

Admin Endpoints

Ride Lifecycle

Role-Based Access

Testing

Future Enhancements

License

Project Overview

This API allows:

Riders to request rides, cancel them, view ride history, rate drivers, and leave feedback.

Drivers to accept rides, update ride status, set availability, and view earnings.

Admins to manage users, approve/suspend drivers, view rides, and generate system stats.

All rides are stored with complete history, and the API implements JWT-based authentication, role-based authorization, and real-time location handling for drivers.

Features

✅ JWT-based login & registration with three roles: admin, rider, driver.

✅ Secure password hashing using bcrypt.

✅ Role-based route protection.

✅ Rider features: request ride, cancel ride (within allowed window), view ride history, rate driver, leave feedback, find nearby drivers.

✅ Driver features: accept/reject ride requests, update ride status, view earnings, set availability (online/offline).

✅ Admin features: view all users, approve/suspend drivers, block/unblock accounts, view rides & statistics.

✅ Ride fare calculation based on distance.

✅ Geocoding addresses into coordinates using OpenStreetMap API.

✅ Full modular project structure for scalability.

Technologies

Node.js + Express.js

TypeScript

MongoDB + Mongoose

JWT Authentication

Zod for validation

Axios (for geocoding)

Cors

dotenv

Installation & Setup
# Clone repository
git clone <your-repo-url>
cd ride-booking-api

# Install dependencies
npm install

# Start server
npm run dev   # for development
npm start     # for production

Environment Variables

Create a .env file in the root directory with:

PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=1d
BCRYPT_SALT=10

API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user (rider/driver/admin)
POST	/api/auth/login	Login and receive JWT token
POST	/api/auth/logout	Logout user
POST	/api/auth/reset-password	Request password reset token
POST	/api/auth/reset-password/:token	Reset password using token
PATCH	/api/auth/update	Update user profile
Rider Endpoints
Method	Endpoint	Description
POST	/api/rides/request	Request a ride
PATCH	/api/rides/:id/cancel	Cancel a ride
GET	/api/rides/me	Get ride history
PATCH	/api/rides/:rideId/rate-driver	Rate driver for a ride
PATCH	/api/rides/:rideId/feedback	Leave feedback for driver
POST	/api/rides/drivers/nearby	Find nearby drivers
Driver Endpoints
Method	Endpoint	Description
PATCH	/api/drivers/availability	Set online/offline availability
PATCH	/api/drivers/rides/:id/accept	Accept a ride request
PATCH	/api/drivers/rides/:id/status	Update ride status (picked_up, in_transit, completed)
GET	/api/drivers/rides/earnings	View earnings from completed rides
Admin Endpoints
Method	Endpoint	Description
GET	/api/admin/users	View all users
GET	/api/admin/users/stats	View total users by role
GET	/api/admin/users/status-stats	View users by status
GET	/api/admin/drivers/ratings	View driver rating stats
GET	/api/admin/rides/stats	View ride statistics
PATCH	/api/admin/drivers/approve/:id	Approve/reject driver
PATCH	/api/admin/users/block/:id	Block/unblock user
GET	/api/admin/rides	View all rides
Ride Lifecycle

Requested – Rider requests a ride.

Accepted – Driver accepts the ride.

Picked Up – Rider is picked up.

In Transit – Ride is in progress.

Completed – Ride finished.

Cancelled – Rider cancels before acceptance.

All timestamps are recorded for audit and history.

Role-Based Access

Riders – Can request, cancel rides, rate drivers, leave feedback.

Drivers – Can accept rides, update ride status, set availability, view earnings.

Admins – Can manage users and rides, approve/suspend drivers, view statistics.

Routes are protected via JWT and role checks.

Testing

Postman collection can be used to test all endpoints.

Health check:

GET /
Response: { message: "Ride Booking API is running!" }

Future Enhancements

Geo-based driver matching in real-time.

Fare estimation based on dynamic pricing.

Rider/Driver rating system enhancements.

Admin dashboard analytics.

WebSocket support for real-time ride tracking.

License

MIT License © 2025
