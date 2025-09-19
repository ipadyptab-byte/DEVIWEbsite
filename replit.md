# Overview

This is a React-based jewelry store website for "Devi Jewellers" built with Create React App. The application serves as a comprehensive e-commerce platform featuring product catalogs, investment schemes, admin functionality, and a specialized TV display system for showing live gold rates. The website includes multiple product categories (rings, earrings, bracelets, etc.), customer contact features, and Firebase integration for real-time data management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18.2.0 with functional components and hooks
- **Routing**: React Router DOM v6 for client-side navigation with nested routes
- **Styling**: SCSS/Sass for component styling with modular architecture
- **UI Components**: 
  - React Slick for carousels and image sliders
  - React Icons for consistent iconography
  - React Rating Stars for product reviews
  - React Scroll Parallax for visual effects
- **Layout Pattern**: Layout wrapper component with header/footer and outlet for page content
- **State Management**: Local React state with useState and useEffect hooks

## Component Structure
- **Pages**: Route-based page components (Home, About, Contact, Admin, etc.)
- **Shared Components**: Reusable UI elements (Header, Footer, ProductCard, etc.)
- **Specialized Components**: 
  - Current rates display with real-time updates
  - Image upload functionality
  - Contact forms and store location maps
  - TV display system for digital signage

## Data Architecture
- **Product Data**: Static dummy data structure for jewelry items with properties like price, rating, category, images
- **Real-time Data**: Firebase Firestore integration for live gold rates
- **File Storage**: Firebase Storage for image uploads and management
- **Data Flow**: Real-time listeners for rate updates, local state for UI interactions

## Authentication & Admin
- **Admin Panel**: Simple form-based interface for updating gold rates
- **No Complex Auth**: Basic admin functionality without sophisticated user management
- **Rate Management**: Centralized system for updating Vedhani, 22KT, 18KT, and Silver prices

## Display Systems
- **Standard Web Interface**: Responsive design for customer browsing
- **TV Display Mode**: Full-screen digital signage interface for in-store rate display
- **Demo Mode**: Simulated data updates for demonstration purposes

# External Dependencies

## Firebase Services
- **Firestore Database**: Real-time NoSQL database for storing gold rates and potentially product data
- **Firebase Storage**: Cloud storage for product images and promotional content
- **Firebase SDK v10.12.5**: Latest Firebase integration for web applications

## UI & Styling Libraries
- **React Slick**: Carousel and slider components for product showcases
- **Slick Carousel**: Base carousel functionality and styling
- **React Icons**: Comprehensive icon library for UI elements
- **React Rating Stars**: Star rating component for product reviews
- **React Scroll Parallax**: Parallax scrolling effects for enhanced UX
- **Sass**: CSS preprocessing for advanced styling capabilities

## Development & Testing
- **Create React App**: Development environment and build tooling
- **React Testing Library**: Component testing utilities
- **Jest**: JavaScript testing framework
- **Web Vitals**: Performance monitoring and analytics

## Font & Design Resources
- **Google Fonts**: Custom typography (Poppins, El Messiri, Material Symbols)
- **Material Symbols**: Icon font for consistent material design icons
- **Custom Assets**: Local images and branding materials stored in public directory

## Map Integration
- **Google Maps Embed**: Store location display for customer directions
- **Responsive Mapping**: Mobile-optimized location services

## Development Configuration
- **Host Configuration**: Custom host settings for development server (0.0.0.0:5000)
- **Security Settings**: Development-specific security configurations
- **Build Optimization**: Production build settings for deployment