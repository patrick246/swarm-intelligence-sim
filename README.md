# Swarm Intelligence Sim
This project is a basic 2D simulation of a robot creating a pile of balls in a physical 2d simulation.

## Development Server
Run ```npm run serve``` for a dev server. Navigate to http://localhost:8080 . You need to reload after refreshing source files.

## Build 
Run ```npm run build``` to build the project. Build artifacts will be stored in the ```dist``` directory.

## Physical Simulation
This simulation uses matter-js as physical simulation engine, see its [Repository](https://github.com/liabru/matter-js) for further information about the engine.

## Architecture
To provide a flexible base for further advancements, this software is designed in a modular way. Useful interfaces for experimenting with different behaviour are:
- ```ClusterSelector``` which decides which balls are considered a cluster
- ```PathStrategy``` which decides in which order clusters are clustered
Due to the higher level of abstraction, ```RobotController``` is used to separate access from the "physical" robot instance and the high-level clustering logic.
