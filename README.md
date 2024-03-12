# Clean and Solid boilerplate for Remix

**What is inside?**
- :bulb: [**TypeScript**](https://www.typescriptlang.org/): A language for application-scale JavaScript
- :heart_decoration: **Back-office Systems Templates**: Typical for enterprise "backend" applications
- :globe_with_meridians: **International**: Built-in i18n solution
- :gear: **Best Practices**: Solid workflow to make your code healthy
- :zap: **Router Redirect**: Avaiable Error boundary page
- :four_leaf_clover: **Plugin Architecture**:  Modify multi project for Enterprise by plugin architecture (DOING)
- :pencil: **Code Conventions**: 
  - [Linter](https://eslint.org/)
  - [Formatter](https://prettier.io/)
  - [Spell checker](https://cspell.org/)
  - [Husky](https://typicode.github.io/husky/)
  - [Commit-lint](https://commitlint.js.org/)
- :rocket: **State of The Art Development**: Newest development stacks:
  - [Zustand](https://zustand-demo.pmnd.rs/)
  - [Shadcn](https://ui.shadcn.com/)
  - [React hook form](https://react-hook-form.com/)
  - [Lodash](https://lodash.com/)
  - [Momentjs](https://momentjs.com/)
  - [React 18](https://react.dev/blog/2022/03/29/react-v18)
  - [Dashboard advanced](https://tanstack.com/table/latest)
- :ok_hand: **Unit Test**: 
  - Fly safely with unit [Jest](https://jestjs.io/)
  - 100% coverage. (DOING)
- :cyclone: **Avaiable CICD**: :construction: doing

## Features

- :white_check_mark: **Authentication**: based on [Remix auth](https://github.com/sergiodxa/remix-auth)
- :white_check_mark: **Role Base Access Control**: 
  - What is [RBAC](https://auth0.com/docs/manage-users/access-control/rbac)?
  - [Workflow](https://bootcamp.uxdesign.cc/designing-roles-and-permissions-ux-case-study-b1940f5a9aa)
- :white_check_mark: **Manage action history**
  
## Code Structure

- **@**: Styles core by [Shadcn](https://ui.shadcn.com/), avaiable Complex Component like [cmdk](https://github.com/pacocoursey/cmdk), [Table](https://tanstack.com/table/latest)
- **app**: contains the main source code
  - **constants**: Reusable constants across the application (both client-server)
  - **hoc**: Store [Higher order function](https://en.wikipedia.org/wiki/Higher-order_function).
  - **hooks**: Store [React custom hook](https://react.dev/learn/reusing-logic-with-custom-hooks).
  - **routes**: Core [Remix's routing system](https://remix.run/docs/en/main/discussion/routes) 
  - **services**: [Backend endpoints and logic](https://remix.run/docs/en/main/file-conventions/-server)
  - **types**: Reuseable for [Typescript](https://www.typescriptlang.org/)
  - **utiles**: Useful function.
- **public**: Static assets such as images, fonts.
- **test**: Unit tests
- **build**: Output directory for compiled code and assets generated during the build process.
- **docs**: Documentation files, including READMEs, guides, and API documentation.

## Development mode

```sh
npm run dev
```

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