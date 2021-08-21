# Pickaxe - A weekly pickem app

![alt text](https://www.possum.best/pickaxe.png)

This application provides an interactive persistent weekly NFL pickem league.

This application was built with

- Javalin Kotlin lightweight web framework
- GraphQL Java
- React
- Apollo graphql React client
- Websockets
- gradle
- postgres

and was developed fully with TDD.  Some technologies (such as out-of-the-box ORM systems) were 
deliberately foregone as learning experiences.

### Features

- Interactive weekly picks for users and realtime updating of other users' picks
- Automatic loading and updating of the NFL game schedules
- Automatic game results as they come in
- Automatic spreads and picks by a "Vegas" player
- Automatic weekly and season scoring
- auth0 authentication