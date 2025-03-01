

# Setting up MongoDB in Docker and creating `games` database

## Step 1: Create a MongoDB container with Docker

Run the following command to create and run a MongoDB container in Docker:

```bash
docker run -d   --name mongodb_container   -p 5000:27017   -e MONGO_INITDB_ROOT_USERNAME=santiago_OP   -e MONGO_INITDB_ROOT_PASSWORD=pes123   -e MONGO_INITDB_DATABASE=path_finder   -v mongodb_data:/data/db   mongo:latest

```

env : ```MONGO_URI=mongodb://pathFinderUser:securePassword123@localhost:5000/pathFinder```

#### Create the games database and the user with permissions

mongosh "mongodb://santiago_OP:pes123@localhost:5000/admin

Once inside the MongoDB client, run the following script to create the games database and a user with full permissions:

```bash

use pathFinder;

db.createUser({
  user: "santiago_OP",
  pwd: "pes123",
  roles: [{ role: "dbOwner", db: "pathFinder" }]
});
```


start the application with npm run start

postman document in the documents folder, here is also the invitation link for the postman worksapce


documento postman en la carpta documents igualmenrt auqi esta el link de invitacion para el worksapce de postma

https://app.getpostman.com/join-team?invite_code=e0207f47528d0e9832ee657b9922fce2e20fbb30d0fdf1060b879f524747ff82&target_code=3f12790ae018779a05bfe8a48b338626


## CODE COVERAGE FORMER :

![alt text](./images/image.png)



## REFACTORIZATION WHERE map is implemented as an example:


### Single Responsibility Principle (SRP):

The structure is clearly separated into:

- MapService: Handles the business logic for maps.
- MapRepository: Responsible only for data access.
- MapController: Manages HTTP requests.
- BaseRepository: Handles basic CRUD operations.

## Open/Closed Principle (OCP):

- BaseRepository is designed to be extended:
- Classes like MapRepository inherit from BaseRepository.
- New specific methods can be added without modifying the base.
- Example: MapRepository adds findByMapId without altering BaseRepository.


## Liskov Substitution Principle (LSP):

- MapRepository extends BaseRepository while maintaining the contract:
- Inherits and maintains base CRUD methods (create, findAll, etc.).
- Methods retain the same signature and expected behavior.
- Results are consistent with the base class.

## Interface Segregation Principle (ISP):

- Services are divided by domain:
- MapService for maps.
- ObstacleService for obstacles.
- WaitPointService for waypoints.
- Each with its specific operations.

## Dependency Inversion Principle (DIP):

- Implemented through dependency injection:
- MapService receives mapRepository and obstacleRepository.
- createContainer() handles the dependency injection.
- Controllers receive their respective services.

## Error Handling:

- Implements the Result pattern using folktale:
- toResult: Wraps operations in a Result.
- handleResult: Handles results and errors.
- Consistent use of try/catch.
- Custom errors with createError.


## Clean Code:

-Descriptive and consistent names.
- Clear separation of responsibilities.
- Use of async/await for asynchronous operations.
- Modular and organized structure.
- Centralized error handling with tryCatch.

## Layered Architecture:

-Controllers: Handle HTTP requests.
- Services: Business logic.
- Repositories: Data access.
- Models: Schema definitions.
