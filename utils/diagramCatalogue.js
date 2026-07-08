const DIAGRAM_TYPES = [
  'Sequence Diagram',
  'Use Case Diagram',
  'Class Diagram',
  'Object Diagram',
  'Activity Diagram',
  'Component Diagram',
  'Deployment Diagram',
  'State Diagram',
  'Timing Diagram',
  'Entity Relationship Diagram',
];

// PROJECT_NAME is substituted at generation time.
// Every template asks for a self-contained @startuml...@enduml block.
const DIAGRAM_PROMPTS = {
  'Sequence Diagram': `Create a detailed PlantUML sequence diagram for a system called "PROJECT_NAME".
Identify the key actors/participants and show the realistic flow of messages between them
for the system's most important use case (e.g. a core user action or request/response flow).
Include activation bars where appropriate, and use alt/opt/loop blocks if relevant.
Output ONLY a single @startuml ... @enduml block.`,

  'Use Case Diagram': `Create a PlantUML use case diagram for a system called "PROJECT_NAME".
Identify the primary actors (users, external systems) and the main use cases they perform.
Group related use cases, and show include/extend relationships where they make sense.
Output ONLY a single @startuml ... @enduml block.`,

  'Class Diagram': `Create a PlantUML class diagram for a system called "PROJECT_NAME".
Model the core domain classes with realistic attributes (with types) and methods.
Show relationships between classes (inheritance, composition, aggregation, association)
with correct UML notation and multiplicities where relevant.
Output ONLY a single @startuml ... @enduml block.`,

  'Object Diagram': `Create a PlantUML object diagram showing a concrete runtime snapshot of objects
for a system called "PROJECT_NAME". Show specific object instances (with sample attribute
values) and the links between them, illustrating one realistic state of the system.
Output ONLY a single @startuml ... @enduml block.`,

  'Activity Diagram': `Create a PlantUML activity diagram for a key business process or workflow within
a system called "PROJECT_NAME". Include the start/end nodes, decision points (if/else),
and any parallel or looping activities relevant to the process.
Output ONLY a single @startuml ... @enduml block.`,

  'Component Diagram': `Create a PlantUML component diagram for a system called "PROJECT_NAME".
Identify the major software components/services/modules and show their interfaces and
dependencies between each other, including any external systems they integrate with.
Output ONLY a single @startuml ... @enduml block.`,

  'Deployment Diagram': `Create a PlantUML deployment diagram for a system called "PROJECT_NAME".
Show the physical/virtual nodes (servers, containers, devices, cloud services), the
software artifacts deployed on each, and the network connections between nodes.
Output ONLY a single @startuml ... @enduml block.`,

  'State Diagram': `Create a PlantUML state diagram modeling the lifecycle of the central entity in a
system called "PROJECT_NAME". Show all relevant states, the events/conditions that
trigger transitions between them, and the initial/final states.
Output ONLY a single @startuml ... @enduml block.`,

  'Timing Diagram': `Create a PlantUML timing diagram for a system called "PROJECT_NAME".
Show how the states or signals of the key components change over time during one
representative scenario, including the relevant timing constraints.
Output ONLY a single @startuml ... @enduml block.`,

  'Entity Relationship Diagram': `Create a PlantUML entity relationship (ER) diagram for the database schema of a
system called "PROJECT_NAME". Identify the core entities with their key attributes
(mark primary keys), and show relationships between entities with correct cardinality
notation.
Output ONLY a single @startuml ... @enduml block.`,
};

const SYSTEM_PROMPT =
  'You are a PlantUML expert. Follow the template provided exactly. ' +
  'Use ONLY single braces { } — never double braces {{ }}. ' +
  'Do NOT add !theme directives. ' +
  'Output ONLY valid PlantUML starting with @startuml and ending with @enduml. ' +
  'No markdown fences, no explanations.';

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

module.exports = { DIAGRAM_TYPES, DIAGRAM_PROMPTS, SYSTEM_PROMPT, GROQ_MODELS };
