# [Remix framework](https://remix.run) Boilerplate

## Features

- :bulb: [**TypeScript**](https://www.typescriptlang.org/): A language for application-scale JavaScript
- :scroll: **Code Conventions**: [Linter](https://eslint.org/), [Formatter](https://prettier.io/), [Spell checker](https://cspell.org/), [Husky](https://typicode.github.io/husky/), [commitlint](https://commitlint.js.org/)
- :gem: **Role Base Access Control**: Follow [RBAC](https://auth0.com/docs/manage-users/access-control/rbac)
- :triangular_ruler: **Back-office Systems Templates**: Typical for enterprise "backend" applications
- :rocket: **State of The Art Development**: Newest development stack [Zustand](https://zustand-demo.pmnd.rs/), [Shadcn](https://ui.shadcn.com/), [React hook form](https://react-hook-form.com/), [Lodash](https://lodash.com/), [Momentjs](https://momentjs.com/), [React 18](https://react.dev/blog/2022/03/29/react-v18), [Table](https://tanstack.com/table/latest)
- :globe_with_meridians: **International**: Built-in i18n solution
- :gear: **Best Practices**: Solid workflow to make your code healthy
- :white_check_mark: **Unit Test**: Fly safely with unit [Jest](https://jestjs.io/)
- :art: **Router Redirect**: Avaiable Error boundary page
- :1234: **Plugin Architecture**:  Modify multi project for Enterprise by plugin architecture (Doing)
- :iphone: **Avaiable CICD**: (Doing)

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