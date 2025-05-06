const db = require("./index");
const bcrypt = require("bcryptjs");

const User = {
  // Create a new user
  create: async (user) => {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Call the stored procedure to register a user
      const [result] = await db.pool.execute(
        "CALL sp_RegisterUser(?, ?, ?, ?, @userId)",
        [user.name, user.email, hashedPassword, user.location]
      );
      
      // Get the output parameter
      const [userIdResult] = await db.pool.execute("SELECT @userId as userId");
      return userIdResult[0].userId;
    } catch (error) {
      throw error;
    }
  },
  
  // Find a user by ID
  findById: async (userId) => {
    try {
      const users = await db.query(
        "SELECT UserID, Name, Email, Location, RegistrationDate, LastLogin, IsActive FROM User WHERE UserID = ?",
        [userId]
      );
      return users.length ? users[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Find a user by email
  findByEmail: async (email) => {
    try {
      const users = await db.query(
        "SELECT UserID, Name, Email, Password, Location, RegistrationDate, LastLogin, IsActive FROM User WHERE Email = ?",
        [email]
      );
      return users.length ? users[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user profile
  update: async (userId, user) => {
    try {
      await db.pool.execute(
        "CALL sp_UpdateUserProfile(?, ?, ?, ?)",
        [userId, user.name, user.email, user.location]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Change user password
  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await db.pool.execute(
        "CALL sp_ChangeUserPassword(?, ?, ?)",
        [userId, oldPassword, hashedPassword]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Deactivate user account
  deactivate: async (userId) => {
    try {
      await db.pool.execute(
        "CALL sp_DeactivateUserAccount(?)",
        [userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Create a new session
  createSession: async (userId, ipAddress, userAgent) => {
    try {
      const [result] = await db.pool.execute(
        "CALL sp_AuthenticateUser(?, ?, ?, ?, @userId, @sessionId)",
        [null, null, ipAddress, userAgent, userId]
      );
      
      // Get the output parameters
      const [sessionResult] = await db.pool.execute("SELECT @sessionId as sessionId");
      return sessionResult[0].sessionId;
    } catch (error) {
      throw error;
    }
  },
  
  // Validate session
  validateSession: async (sessionId) => {
    try {
      const sessions = await db.query(
        "SELECT UserID FROM UserSession WHERE SessionID = ? AND ExpiresAt > NOW()",
        [sessionId]
      );
      return sessions.length ? sessions[0].UserID : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete session (logout)
  deleteSession: async (sessionId) => {
    try {
      await db.pool.execute(
        "CALL sp_LogoutUser(?)",
        [sessionId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;