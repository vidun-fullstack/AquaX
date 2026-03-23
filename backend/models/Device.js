/**
 * Device Structure
 * Defines the structure of Device objects
 */

class Device {
  constructor(name, user) {
    this.name = name;      // Device name
    this.user = user;      // User who owns the device
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Optional: log when structure is loaded
console.log("Device structure created");

module.exports = Device;
