/**
 * Sensor Structure
 * Defines the structure of Sensor objects
 */

class Sensor {
  constructor(type, device) {
    this.type = type;     // Sensor type
    this.device = device; // Device it belongs to
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Sensor;
