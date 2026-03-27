use("estateease")

db.users.deleteMany({})
db.properties.deleteMany({})
db.bookings.deleteMany({})
db.payments.deleteMany({})
db.reviews.deleteMany({})
db.fraudreports.deleteMany({})
db.propertydocuments.deleteMany({})
db.verificationlogs.deleteMany({})

db.users.insertMany([
{
  _id: ObjectId("689b3b000000000000000001"),
  fname: "Main Admin",
  email: "admin@estateease.com",
  phone: "9999999999",
  role: "admin",
  isVerified: true,
  isBlocked: false,
  profileImage: "/uploads/properties/avatar-1.jpg"
},
{
  _id: ObjectId("689b3b000000000000000002"),
  fname: "Amit Seller",
  email: "seller1@gmail.com",
  phone: "9000000001",
  role: "seller",
  isVerified: true,
  isBlocked: false,
  profileImage: "/uploads/properties/avatar-2.jpg"
},
{
  _id: ObjectId("689b3b000000000000000003"),
  fname: "Neha Seller",
  email: "seller2@gmail.com",
  phone: "9000000002",
  role: "seller",
  isVerified: false,
  isBlocked: false,
  profileImage: "/uploads/properties/avatar-3.jpg"
},
{
  _id: ObjectId("689b3b000000000000000004"),
  fname: "Riya Buyer",
  email: "buyer1@gmail.com",
  phone: "9000000011",
  role: "buyer",
  isVerified: true,
  isBlocked: false,
  profileImage: "/uploads/properties/avatar-4.jpg"
},
{
  _id: ObjectId("689b3b000000000000000005"),
  fname: "Karan Renter",
  email: "renter1@gmail.com",
  phone: "9000000022",
  role: "renter",
  isVerified: true,
  isBlocked: false,
  profileImage: "/uploads/properties/avatar-1.jpg"
}
])

db.properties.insertMany([
{
  _id: ObjectId("689b3b000000000000000101"),
  ownerId: ObjectId("689b3b000000000000000002"),
  title: "2BHK Flat near ISBT",
  description: "Well furnished 2BHK flat with parking and lift.",
  type: "rent",
  price: 16000,
  location: {
    city: "Dehradun",
    address: "ISBT Road, Dehradun"
  },
  images: ["property-1.jpg"],
  status: "active",
  isVerified: true,
  flaggedAsFraud: false
},
{
  _id: ObjectId("689b3b000000000000000102"),
  ownerId: ObjectId("689b3b000000000000000002"),
  title: "3BHK Independent House",
  description: "Spacious independent house with balcony and garden.",
  type: "sell",
  price: 6200000,
  location: {
    city: "Dehradun",
    address: "Rajpur Road, Dehradun"
  },
  images: ["property-2.jpg"],
  status: "active",
  isVerified: false,
  flaggedAsFraud: false
},
{
  _id: ObjectId("689b3b000000000000000103"),
  ownerId: ObjectId("689b3b000000000000000003"),
  title: "1RK Budget Room",
  description: "Affordable room for students and bachelors.",
  type: "rent",
  price: 7000,
  location: {
    city: "Dehradun",
    address: "Clement Town, Dehradun"
  },
  images: ["property-3.jpg"],
  status: "active",
  isVerified: false,
  flaggedAsFraud: true
}
])

db.bookings.insertMany([
{
  _id: ObjectId("689b3b000000000000000201"),
  propertyId: ObjectId("689b3b000000000000000101"),
  buyerOrRenterId: ObjectId("689b3b000000000000000005"),
  bookingType: "rent",
  message: "I want to visit this property on Sunday.",
  status: "pending",
  isVerified: false
},
{
  _id: ObjectId("689b3b000000000000000202"),
  propertyId: ObjectId("689b3b000000000000000102"),
  buyerOrRenterId: ObjectId("689b3b000000000000000004"),
  bookingType: "buy",
  message: "Please share more details and photos.",
  status: "pending",
  isVerified: false
}
])

db.payments.insertMany([
{
  _id: ObjectId("689b3b000000000000000301"),
  bookingId: ObjectId("689b3b000000000000000201"),
  amount: 1000,
  method: "upi",
  status: "success",
  transactionRef: "DEMO-UPI-123456"
},
{
  _id: ObjectId("689b3b000000000000000302"),
  bookingId: ObjectId("689b3b000000000000000202"),
  amount: 5000,
  method: "card",
  status: "initiated",
  transactionRef: "DEMO-CARD-987654"
}
])

db.reviews.insertMany([
{
  _id: ObjectId("689b3b000000000000000401"),
  propertyId: ObjectId("689b3b000000000000000101"),
  reviewerId: ObjectId("689b3b000000000000000005"),
  rating: 4,
  comment: "Good location and decent property."
},
{
  _id: ObjectId("689b3b000000000000000402"),
  propertyId: ObjectId("689b3b000000000000000101"),
  reviewerId: ObjectId("689b3b000000000000000004"),
  rating: 5,
  comment: "Nice property and good communication."
}
])

db.fraudreports.insertMany([
{
  _id: ObjectId("689b3b000000000000000501"),
  propertyId: ObjectId("689b3b000000000000000103"),
  reportedBy: ObjectId("689b3b000000000000000004"),
  reason: "Suspicious price and incomplete details.",
  status: "open"
}
])

db.propertydocuments.insertMany([
{
  _id: ObjectId("689b3b000000000000000601"),
  propertyId: ObjectId("689b3b000000000000000102"),
  uploadedBy: ObjectId("689b3b000000000000000002"),
  docType: "ownership_proof",
  docUrl: "https://example.com/docs/ownership-proof.pdf",
  isVerified: false
},
{
  _id: ObjectId("689b3b000000000000000602"),
  propertyId: ObjectId("689b3b000000000000000101"),
  uploadedBy: ObjectId("689b3b000000000000000002"),
  docType: "rent_agreement",
  docUrl: "https://example.com/docs/rent-agreement.pdf",
  isVerified: true
}
])

db.verificationlogs.insertMany([
{
  _id: ObjectId("689b3b000000000000000701"),
  adminId: ObjectId("689b3b000000000000000001"),
  targetType: "user",
  targetId: ObjectId("689b3b000000000000000002"),
  action: "verify",
  note: "Seller verified by admin."
},
{
  _id: ObjectId("689b3b000000000000000702"),
  adminId: ObjectId("689b3b000000000000000001"),
  targetType: "property",
  targetId: ObjectId("689b3b000000000000000101"),
  action: "verify",
  note: "Property verified after review."
},
{
  _id: ObjectId("689b3b000000000000000703"),
  adminId: ObjectId("689b3b000000000000000001"),
  targetType: "fraud",
  targetId: ObjectId("689b3b000000000000000501"),
  action: "review",
  note: "Fraud report under investigation."
}
])