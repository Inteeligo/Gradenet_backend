const { Model, DataTypes } = require('sequelize');
const Agent =require('../models/agentModel');
const sequelize = require('../config/db'); // Import your sequelize instance

class PreOrder extends Model {}

PreOrder.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Please enter a valid email address",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: [/^\+?[1-9]\d{1,14}$/],
          msg: "Please enter a valid phone number",
        },
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    homeType: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    gpsAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: [/^[A-Z]{2}-\d{4}-\d{4}$/],
          msg: "GPS Address must follow the format AK-0039-5028",
        },
      },
    },
    installationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Please enter a valid date",
        },
      },
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Will be populated after finding agent by name
      references: {
        model: 'agents', // Name of the Agent table
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'potential'),
      allowNull: false,
      defaultValue: 'potential',
    },
    engagement: {
      type: DataTypes.FLOAT, 
      allowNull: true,
    },
    package: {
      type: DataTypes.JSON,  // Use JSON data type for MySQL or SQLite
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Package is required",
        },
        isValidPackage(value) {
          if (value && ((value.monthlyPrice && value.yearlyPrice) || (!value.monthlyPrice && !value.yearlyPrice))) {
            throw new Error('Either monthlyPrice or yearlyPrice must be provided, but not both.');
          }
        },
      },
    },
},
  {
    sequelize, // Sequelize instance
    modelName: 'PreOrder',
    tableName: 'preOrders',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (preOrder, options) => {
        if (preOrder.agentId) {
          const agent = await sequelize.models.Agent.findByPk(preOrder.agentId);
          if (!agent) {
            throw new Error("Agent not found.");
          }
        }
      },
    },
  }
);

PreOrder.associate = (models) => {
  PreOrder.belongsTo(models.Agent, {
    foreignKey: 'agentId',
    as: 'agent',
  });
};

module.exports = PreOrder;
