# BIO Mobile App

Mobile application for user management with authentication and viewing the list of users.

## Functionality

### Main features:
- **User registration** - create a new account with validation
- **Authorization** - login with email and password
- **User list** - view all registered users
- **User search** - filter by name, last name or email
- **Detailed information** - detailed view of user profile
- **Pull-to-refresh** - refresh list by swipe down
- **Loading states** - loading indicators and error handling

## Project structure

```
BIO_mobile/
├── app/                         # Application Screens (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx            # Home - user list
│   │   └── _layout.tsx          # Layout for tabs
│   ├── auth/
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── users/
│   │   └── [id].tsx             # User details
│   ├── _layout.tsx              # Main layout
│   └── index.tsx                # Entry point
│
├── src/                         # Business logic
│   ├── components/              # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── UserCard.tsx
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx
│   │   └── QueryProvider.tsx
│   ├── hooks/                   # Custom hooks
│   │   └── useUsers.ts
│   ├── screens/                 # Screen logic
│   │   ├── auth/
│   │   └── users/
│   ├── services/                # API services
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── types/                   # TypeScript types
│   │   ├── user.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   └── config/                  # Configuration
│       └── api.ts
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on mobile

### Installation and Run

**Installing dependencies:**
```bash
cd BIO_mobile
npm install
```

**Running the application:**
```bash
npm start
```

## Configuration

### API settings
The application connects to the backend at: `http://localhost:3000/api/v1`

To change the API URL, update the `src/config/api.ts` file:

```typescript
export const API_CONFIG = {
baseURL: 'YOUR_API_URL',
timeout: 10000,
};
```

## Using the application

### 1. Registration
- Fill out the registration form (first name, last name, email, password)
- Password must contain at least 6 characters, uppercase letter, lowercase letter and number
- After successful registration, you will be automatically logged in

### 2. Login
- Enter email and password
- Use the "Show/Hide" button to view the password
- Upon successful login, a list of users will open

### 3. User list
- View all registered users
- Use the search to filter by first name, last name or email
- Pull down the list to refresh
- Click on the user card to view details

### 4. User profile
- View detailed information about the user
- Date of registration and last update
- Activity status

## Security

- **JWT tokens** are stored in AsyncStorage (cross-platform)
- **Automatically add tokens** to all secure requests
- **Request timeouts** to prevent hangs
- **Form validation** using Zod schemas
- **Error handling** with clear messages

## UI/UX features

### Modern design:
- Card interface with shadows
- iOS color scheme
- Adaptive components
- Animations and transitions

### Interface states:
- Loading indicators
- Error messages with repeatability
- Empty states for empty lists
- Real-time form validation

### Accessibility:
- VoiceOver/TalkBack support
- Optimal touch target sizes
- Readable colors and contrasts

## Testing

To run tests (if added):
```bash
npm test
```

## API integration

The application works with the following endpoints:

### Authentication:
- `POST /auth/register` - register
- `POST /auth/login` - login

### Users:
- `GET /users` - list of users (requires token)
- `GET /users/:id` - user details (requires token)

## Deployment

### Production Build:
```bash
# iOS
expo build:ios

# Android
expo build:android
```

### EAS Build (recommended):
```bash
npm install -g eas-cli
eas build --platform all
```

## Tech Stack

### Frontend:
- **React Native** - cross-platform development
- **Expo Router** - navigation and routing
- **React Query (@tanstack/react-query)** - server state management
- **React Context API** - global authentication state
- **React Hook Form + Zod** - working with forms and validation
- **TypeScript** - typing
- **AsyncStorage** - persistent token storage (cross-platform)

### Architecture:
- **Feature-Sliced ​​Design (FSD)** - architectural methodology
- **Reusable components** - Button, Input, Loading, Error
- **Services** - API client with error handling
- **Hooks** - custom hooks for working with data
