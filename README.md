# Password Manager Backend

This is the backend for a secure password manager application. It provides APIs for user authentication, secure storage of credentials, and encryption/decryption of sensitive data.

## Features

- **User Authentication**: Register and login functionality with JWT-based authentication.
- **Secure Vault**: Store, retrieve, update, and delete encrypted credentials.
- **Encryption**: AES-256-GCM encryption for sensitive data.
- **Rate Limiting**: Protects against brute force attacks.
- **Error Handling**: Centralized error handling for better debugging.

## Project Structure

```
password-manager-server/
├── .env.example         # Example environment variables
├── .gitignore           # Files and directories to ignore in Git
├── index.js             # Entry point of the application
├── package.json         # Project dependencies and scripts
├── src/
│   ├── config/
│   │   └── db.js        # MongoDB connection setup
│   ├── middleware/
│   │   ├── auth.js      # Authentication middleware
│   │   └── errorHandler.js # Centralized error handling
│   ├── models/
│   │   ├── User.js      # User schema
│   │   └── Vaults.js    # Vault schema for storing encrypted credentials
│   ├── routes/
│   │   ├── auth.js      # Authentication routes
│   │   └── keystore.js  # Vault management routes
│   └── utils/
│       └── crypto.js    # Utility functions for encryption and decryption
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SudipMHX/password-manager-server.git
   cd password-manager-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**  
  Register a new user.  
  **Body**: `{name, email, password }`

- **POST /api/auth/login**  
  Login an existing user.  
  **Body**: `{ email, password }`

### Vault Management

- **POST /api/vault/**  
  Create a new vault entry.  
  **Body**: `{ data: { app, email, username, password, authenticator } }`

- **GET /api/vault/**  
  Retrieve all vault entries (decrypted).

- **PUT /api/vault/:id**  
  Update a vault entry.  
  **Body**: `{ data: { app, email, username, password, authenticator } }`

- **DELETE /api/vault/:id**  
  Delete a vault entry.

## Security

- **Encryption**: AES-256-GCM is used for encrypting sensitive data.
- **JWT**: JSON Web Tokens are used for user authentication.
- **Rate Limiting**: Limits the number of requests to prevent abuse.

## Environment Variables

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `PORT`       | Port number for the server           |
| `MONGO_URI`  | MongoDB connection string            |
| `JWT_SECRET` | Secret key for signing JWT tokens    |
| `NODE_ENV`   | Environment (development/production) |

## Dependencies

- **Express**: Web framework for Node.js.
- **Mongoose**: MongoDB object modeling.
- **jsonwebtoken**: For JWT-based authentication.
- **bcryptjs**: For hashing passwords.
- **crypto**: For encryption and decryption.
- **dotenv**: For environment variable management.
- **helmet**: For securing HTTP headers.
- **express-rate-limit**: For rate limiting.

## Development

- **Nodemon**: Automatically restarts the server on file changes.

## License

This project is licensed under the MIT License.