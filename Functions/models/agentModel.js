const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db'); // Import your sequelize instance

class Agent extends Model {
  // Method to compare password for login
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

Agent.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: {
        msg: 'Please fill a valid email address'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: [/^\+?[1-9]\d{1,14}$/],
        msg: 'Please enter a valid phone number'
      }
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hearAboutUs: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: 'Password must be at least 6 characters long'
      },
      isAlphanumeric: {
        msg: 'Password must be alphanumeric'
      }
    }
  },
  confirmPassword: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isAlphanumeric: {
        msg: 'Confirm password must be alphanumeric'
      },
      isMatch(value) {
        if (value !== this.password) {
          throw new Error('Passwords do not match');
        }
      }
    }
  },
  agree: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize, // Sequelize instance
  modelName: 'Agent',
  tableName: 'agents',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: async (agent, options) => {
      // Remove confirmPassword before saving the agent to DB
      if (agent.confirmPassword === agent.password) {
        agent.confirmPassword = undefined;
      }
      
      // Hash password if it's modified
      if (agent.password) {
        agent.password = await bcrypt.hash(agent.password, 10);
      }
    }
  }
});

module.exports = Agent;
