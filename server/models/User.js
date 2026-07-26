const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNumber: String,
    highestQualification: String,
    employmentStatus: String,
    skills: [String],
    resume: String,
    preferredRoles: [String],
    preferredLocations: [String],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    this.password = hashedPassword;
    next();
  });
});

// Compare password method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);