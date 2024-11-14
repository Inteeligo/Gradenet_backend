const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your sequelize instance

class PreOrder extends Model {}

PreOrder.init({
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: "Please enter a valid email address"
      }
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: [/^\+?[1-9]\d{1,14}$/],
        msg: "Please enter a valid phone number"
      }
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  homeType: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  gpsAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: [/^[A-Z]{2}-\d{4}-\d{4}$/],
        msg: "GPS Address must follow the format AK-0039-5028"
      }
    }
  },
  installationDate: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isDate: {
        msg: "Please enter a valid date"
      }
    }
  },
  agentName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  // Define the 'package' field as a JSON object containing title, monthlyPrice, and yearlyPrice
  package: {
    type: DataTypes.JSON,  // Use JSON data type for MySQL or SQLite
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Package is required"
      },
      isValidPackage(value) {
        if (value && ((value.monthlyPrice && value.yearlyPrice) || (!value.monthlyPrice && !value.yearlyPrice))) {
          throw new Error('Either monthlyPrice or yearlyPrice must be provided, but not both.');
        }
      }
    }
  }
}, {
  sequelize, // Sequelize instance
  modelName: 'PreOrder',
  tableName: 'preOrders',
  timestamps: true,
  underscored: true
});

module.exports = PreOrder;
