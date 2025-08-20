# GamePlan

**GamePlan** is a simple and flexible planning tool to keep track of resources in complex board games like *Terra
Mystica*, *Gaia Project*, *Root*, and many others. It allows players to plan ahead, plan turns, and track resource
changes over time.

> Designed with tabletop gamers in mind, especially for strategic planning in resource-heavy games.

## 🚧 Project Status

GamePlan is currently in development. The backend is functional. The frontend is in progress.

## ✨ Planned Features

### 🔹 Core Features

- Add and remove **turns**, each with:
    - A **comment** or label (free text)
    - Manual **resource changes** (+ / -)
- Configurable **resources per game** (defined in backend JSON)
- **Live resource summary** with per-turn calculation
- **Warnings** for negative resource totals

### 💾 Persistence

- Save and load plans by **anonymous username** (no login required)
- Support for:
    - **Multiple games per user**
    - **Multiple plans per game**
    - **Copying** a plan (for branching scenarios)
    - **Deleting** plans
- Simple, shareable URLs: \<domain>/\<username>/\<game_id>/\<plan_id>
- Example: `game-plan.net/tobias/tm1/3` → 3rd plan for Tobias’ first Terra Mystica game

### 🛠️ Configuration

- Backend uses JSON **config files** for each game
- Each config defines available resources
- No admin UI needed for now—just drop files into a config directory

### 📤 Import / Export

- Plans can be **exported** and **imported** (e.g. for testing or sharing)

## 🌱 Additional (Future) Features

- Resource **templates** for predefined starting states
- Support for **nested or grouped resources** (e.g. Power Bowls in *Terra Mystica*)
- **Undo/Redo** for turn/resource edits

## 🧩 Design

GamePlan is **mobile-first** but fully responsive:

- **Top**: Current totals
- **Bottom**: Expandable list of turns
- **Accordions** for editing individual turns
- Optional **overlay sidebar** for actions like "new plan", "copy plan", etc.

## ⚙️ Tech Stack

- **Frontend**: React
- **Backend**: Quarkus (Java)
- **Data**: JSON-based config files and plan storage

## 🧠 Why GamePlan?

Modern board games often demand forward-thinking strategies and careful resource planning. GamePlan gives players a
distraction-free space to simulate and refine their ideas—whether it's to prep for a competitive tournament or just
optimize that next epic engine combo.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙌 Contributions

Feedback and contributions are welcome! Whether you're a developer, designer, or gamer, feel free to open issues,
suggest features, or submit pull requests.
