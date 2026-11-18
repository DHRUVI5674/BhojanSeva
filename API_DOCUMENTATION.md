# BhojanSeva — Complete REST API Documentation

Base URL: `http://<SERVER_HOST>:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **POST** `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Radhe Caterers",
  "email": "donor@example.com",
  "password": "Password123!",
  "phone": "+91 9876543210",
  "role": "donor", // "donor" | "recipient" | "volunteer" | "admin"
  "organizationName": "Radhe Caterers Pvt Ltd",
  "address": "SG Highway, Ahmedabad",
  "coordinates": [72.5074, 23.0338]
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "...",
    "name": "Radhe Caterers",
    "email": "donor@example.com",
    "phone": "+91 9876543210",
    "role": "donor"
  }
}
```

### 1.2 Login User
- **POST** `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "donor@example.com",
  "password": "Password123!"
}
```

### 1.3 Get Current User Profile
- **GET** `/api/auth/me`
- **Access**: Private (Bearer JWT)

### 1.4 Update User Profile
- **PUT** `/api/auth/profile`
- **Access**: Private (Bearer JWT)
- **Request Body**:
```json
{
  "name": "Radhe Caterers & Banquet",
  "phone": "+91 9876543219",
  "organizationName": "Radhe Caterers & Event Mgmt",
  "address": "Near Iscon Cross Road, Ahmedabad"
}
```

### 1.5 Change Password
- **PUT** `/api/auth/change-password`
- **Access**: Private (Bearer JWT)

### 1.6 Forgot Password
- **POST** `/api/auth/forgot-password`
- **Access**: Public

---

## 2. Food Donation Endpoints (`/api/donations`)

### 2.1 Create Food Donation
- **POST** `/api/donations`
- **Access**: Private (Donor, Admin)
- **Request Body**:
```json
{
  "title": "50 Servings Fresh Gujarati Dal, Rice & Roti",
  "description": "Cooked 2 hours ago for catering event. Packed in hygienic containers.",
  "category": "cooked_meals", // cooked_meals | raw_ingredients | packaged_food | bakery_items | fruits_vegetables | beverages | other
  "quantity": 50,
  "unit": "servings", // kg | packets | servings | boxes | liters | items
  "peopleServed": 50,
  "expiryTime": "2026-11-19T18:00:00.000Z",
  "isVegetarian": true,
  "pickupAddress": "Radhe Banquet, SG Highway, Ahmedabad",
  "pickupInstructions": "Call front desk upon arrival",
  "coordinates": [72.5074, 23.0338],
  "images": ["data:image/jpeg;base64,..."]
}
```

### 2.2 Browse / Search Food Donations
- **GET** `/api/donations`
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `status`: `AVAILABLE` (default)
  - `category`: `cooked_meals`
  - `isVegetarian`: `true` | `false`
  - `search`: text search for food title or address
  - `lat`, `lng`, `maxDistance`: proximity radius filter
  - `page`, `limit`: pagination

### 2.3 Get Donation Details
- **GET** `/api/donations/:id`
- **Access**: Public / Authenticated

### 2.4 Get My Donations (Donor)
- **GET** `/api/donations/my-donations`
- **Access**: Private (Donor, Admin)

### 2.5 Update Donation
- **PUT** `/api/donations/:id`
- **Access**: Private (Owner Donor, Admin)

### 2.6 Cancel Donation
- **PUT** `/api/donations/:id/cancel`
- **Access**: Private (Owner Donor, Admin)

---

## 3. Donation Request Endpoints (`/api/requests`)

### 3.1 Create Food Request
- **POST** `/api/requests`
- **Access**: Private (Recipient, Admin)
- **Request Body**:
```json
{
  "donationId": "65b...",
  "requestedQuantity": 50,
  "peopleToFeed": 50,
  "deliveryAddress": "Sneha Bal Ashram, Paldi, Ahmedabad",
  "deliveryInstructions": "Deliver to community kitchen entrance"
}
```

### 3.2 View My Requests (Recipient)
- **GET** `/api/requests/my-requests`
- **Access**: Private (Recipient, Admin)

### 3.3 View Incoming Requests (Donor)
- **GET** `/api/requests/incoming`
- **Access**: Private (Donor, Admin)

### 3.4 Accept or Reject Request (Donor)
- **PUT** `/api/requests/:id/status`
- **Access**: Private (Owner Donor, Admin)
- **Request Body**:
```json
{
  "status": "ACCEPTED", // "ACCEPTED" | "REJECTED"
  "donorNotes": "Food packed and ready for volunteer pickup."
}
```

### 3.5 Cancel Request (Recipient)
- **PUT** `/api/requests/:id/cancel`
- **Access**: Private (Recipient, Admin)

---

## 4. Volunteer Endpoints (`/api/volunteer`)

### 4.1 View Available Tasks Ready for Claim
- **GET** `/api/volunteer/available-tasks`
- **Access**: Private (Volunteer, Admin)

### 4.2 View My Delivery Tasks
- **GET** `/api/volunteer/my-tasks`
- **Access**: Private (Volunteer, Admin)

### 4.3 Accept / Claim Task
- **PUT** `/api/volunteer/tasks/:id/accept`
- **Access**: Private (Volunteer, Admin)

### 4.4 Confirm Pickup from Donor
- **PUT** `/api/volunteer/tasks/:id/pickup`
- **Access**: Private (Assigned Volunteer, Admin)

### 4.5 Confirm Delivery to Recipient
- **PUT** `/api/volunteer/tasks/:id/deliver`
- **Access**: Private (Assigned Volunteer, Admin)

### 4.6 Volunteer Dashboard Stats
- **GET** `/api/volunteer/stats`
- **Access**: Private (Volunteer, Admin)

---

## 5. Notification Endpoints (`/api/notifications`)

### 5.1 Get User Notifications
- **GET** `/api/notifications`
- **Access**: Private (Authenticated)

### 5.2 Mark Single Notification as Read
- **PUT** `/api/notifications/:id/read`
- **Access**: Private (Recipient of notification)

### 5.3 Mark All Notifications as Read
- **PUT** `/api/notifications/read-all`
- **Access**: Private (Authenticated)

---

## 6. Admin Management Endpoints (`/api/admin`)

### 6.1 Platform Stats & Metrics
- **GET** `/api/admin/stats`
- **Access**: Private (Admin)

### 6.2 Get All Users
- **GET** `/api/admin/users?role=donor&page=1`
- **Access**: Private (Admin)

### 6.3 Update User Status
- **PUT** `/api/admin/users/:id/status`
- **Access**: Private (Admin)
- **Request Body**: `{ "isActive": false }`

### 6.4 Delete User
- **DELETE** `/api/admin/users/:id`
- **Access**: Private (Admin)

### 6.5 Get All Donations
- **GET** `/api/admin/donations`
- **Access**: Private (Admin)

### 6.6 Get All Volunteers
- **GET** `/api/admin/volunteers`
- **Access**: Private (Admin)
