# Military Strike: All Modes

## Current State
New project. No existing game code.

## Requested Changes (Diff)

### Add
- Top-down 2D military base shooter game using Canvas API
- Player soldier controlled with WASD (movement) + mouse (aim) + click (shoot)
- Three game modes selectable from main menu:
  1. **Survival Mode** -- Enemy soldier waves keep coming, increasing difficulty. Survive as long as possible.
  2. **Mission Mode** -- 5 missions with objectives (eliminate enemies, reach checkpoint, protect base)
  3. **Sandbox Mode** -- Free play, unlimited ammo, spawn enemies manually, no lose condition
- Enemy soldiers with basic AI (patrol, chase, shoot at player)
- Multiple weapons: Pistol, Assault Rifle, Shotgun, Sniper
- Health system, ammo system, score system
- Military base map with obstacles (walls, sandbags, buildings)
- Explosions, bullet effects, blood splatter effects
- Game HUD: health bar, ammo count, score, wave number
- Main menu with mode selection
- Game over / mission complete screen
- Backend stores high scores per mode

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store player scores and high scores for each mode
2. Frontend: Canvas-based game engine with game loop, entity system
3. Implement player movement, aiming, shooting
4. Implement enemy AI (patrol, aggro, shoot)
5. Implement all 3 game modes with mode-specific logic
6. Weapons system with 4 gun types
7. Map with obstacles
8. HUD and menus
9. Sound effects via Web Audio API
