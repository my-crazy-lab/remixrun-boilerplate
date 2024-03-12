# [Remix framework](https://remix.run) Boilerplate

## Dev started
From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

## Introduction

This repository serves as a Remix boilerplate with features such as authentication, password management, login via verification code, and role-based access control (RBAC).

## Table of Contents

1. [Structure of the Codebase](#structure-codebase)
2. [Code Convention](#code-convention)
3. [Remix & React Matching Pattern](#remix-react-pattern)
4. [Role-Based Access Control (RBAC) Technical Specification](#rbac-spec)
5. [Middleware Explanation: Higher-Order Components (HOCs) and i18n Workflow](#middleware-explanation)
6. [UI Styling with Shadcn and Tailwind CSS Configuration](#ui-styling)
7. [Error Pages: 404 and 500](#error-pages)

## Structure of the Codebase

The codebase follows a structured approach to maintainability and scalability. It consists of various directories and files organized based on functionality and feature modules.

## Code Convention

Consistent code convention is followed throughout the project to ensure readability and maintainability. This includes naming conventions, indentation, and code structure.

## Remix & React Matching Pattern

Remix and React are used together in a matching pattern to leverage the best of both worlds. This ensures a seamless integration of server-side rendering with React components.

## Role-Based Access Control (RBAC) Technical Specification

The RBAC system is implemented to manage user permissions and access rights effectively. This includes defining roles, assigning permissions, and enforcing access control rules.

## Middleware Explanation

Middleware such as Higher-Order Components (HOCs) and internationalization (i18n) workflow are explained in detail. HOCs are used for code reusability and separation of concerns, while i18n supports localization and multilingual support.

## UI Styling with Shadcn and Tailwind CSS Configuration

The user interface is styled using Shadcn and Tailwind CSS, providing a robust styling solution with utility classes and customizable themes.

## Error Pages: 404 and 500

Custom error pages are created for handling 404 (Not Found) and 500 (Internal Server Error) responses gracefully. These pages provide informative messages and guide users back to the correct path.

Feel free to explore the codebase and utilize the provided features for your Remix projects!

