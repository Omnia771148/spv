import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  savedAddresses: [
    {
      label: { type: String }, // e.g., Home, Office, Other
      flatNo: { type: String },
      street: { type: String },
      landmark: { type: String },
      lat: { type: Number },
      lng: { type: Number },
      url: { type: String }
    }
  ],
  savedAddress: { // Legacy field for migration
    label: { type: String },
    flatNo: { type: String },
    street: { type: String },
    landmark: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    url: { type: String }
  }
});

// Force re-registering the model with the updated schema in development
const User = mongoose.models.User || mongoose.model("User", userSchema);
if (mongoose.models.User && userSchema) {
  // This helps apply schema changes during development
  User.schema = userSchema;
}
export default User;
