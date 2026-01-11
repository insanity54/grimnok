# The adventures of Grimnâk

## Project requirements

* [x] [devbox](https://www.jetify.com/docs/devbox/installing-devbox)
* [x] club penguin style movement
* [x] Fantasy RPG
* [ ] Easy to update
* [ ] Fun to play
* [ ] Nakama multiplayer
* [x] Nostr auth
* [ ] User accounts
* [ ] Inventory
* [ ] Beasts
  * [ ] No monsters-- only beasts.
  * [ ] Beast keeper-- guy who sells beasts (at a premium)
  * [ ] World stateful shop, restocked by Cron
  * [ ] Loot
* [ ] General store
* [ ] Leaderboard
* [x] portals (travel between maps)
* [x] Town Square
* [x] maps
* [ ] chat
* [ ] Purchase a home
  * [ ] limited market
  * [ ] player economy
  * [ ] have to be level 21 before you can buy
  * [ ] pay sats or Gol
  * [ ] ~27,000 Satoshi
  * [ ] ~1M Gol
* [ ] collection view
  * [ ] limited by default
  * [ ] have to upgrade to unlock the full set
* [ ] fun cursors, hover fx
* [ ] gacha, unlocked with satoshis
* [ ] paint brush
* [ ] gambling
* [ ] skill-based gaming
* [ ] fishing
* [ ] mythic (anything)
* [ ] void rondo
* [ ] Sword in stone-- 1 in 1 million chance of pulling rare item
* [ ] Arcade
  * [ ] Crane game - persistent world-stateful item placement and restocking - limited seats to play at machines
    * [ ] statistical RNG for each step of the game. 
    * [ ] successful pickup? diceroll.
    * [ ] item drop during lift? diceroll.
      * [ ] item fall and displace in tray? diceroll. 
    * [ ] item drop during x/y zero? diceroll.
      * [ ] item fall and displace in tray? diceroll. 
    * [ ] if still held by claw, successful acquisition.
    * [ ] items can be stacked atop others
* [ ] 3+ ways to earn Gol
  * [ ] Random spawns on designated tiles
  * [ ] Random drops from killing beasts
  * [ ] Selling items to the general store
* [ ] 3+ ways to spend Gol
  * [ ] Buying items from the general store
  * [ ] Playing games at the Arcade
  * [ ] Dropping it on the ground
* [ ] 3 ways to monetize
  * [ ] Receive Sats for player bought house
  * [ ] Receive Sats for Gol purchases
  * [ ] Receive Sats for beast purchases
* [ ] Community goal object which lets players burn Gol to advance towards co-op success
* [ ] ASDF spell casting (home row by default)
* [ ] Custom keybinds
* [ ] Midair spell collision combinations (a.la Magicka)
* [ ] Crane game minigame
* [ ] Fortune teller (cost Gol)
* [ ] ratelimited packages/app `/api/nip98-token` endpoints

## Dev

### Getting started

Install deps

    devbox install

Start pg

    devbox services up

Init db

    initdb

Create db user

    createuser --superuser --username=nakama

Create nakama db

    createdb nakama

Once nakama is running, go to http://localhost:7351. The default creds are admin:password

## Credits

Adventurer spritesheet by rvros https://rvros.itch.io/animated-pixel-hero


### Inspiration

* NeoPets
* Habbo Hotel
* Club Penguin
* Runescape
* Pokemon
* Crane Games
* FlyFF
* Gai Online
* Diablo
* Magicka
* League of Legends
* Reconquer Online (dead MMORPG)


#### Lessons learned from other games

##### Gaia Online

  * Don't inflate the in-game currency
  * Don't allow players to buy in-game gold using dollars

##### Reconquer Online

  * Keep the content coming. Players check out when updates are infrequent.
  * Give the players tools to solve in-game problems/disputes themselves.

##### Magicka

  * It's OK if your game crashes, as long as it's a fun game..

##### Crane Games

  * Failure is part of the experience
  * The struggle for a thing you want is usually more fun than owning the thing you want

##### Habbo Hotel

  * Communities build themselves
  * Players crave belongings

##### NeoPets

  * Collecting things is really fun and addicting
  * A great game emerges from many simple games
  * Economics is everything
  * Never lose your password

##### Runescape

  * Never lose your password.
  * Grindy games aren't bad. They're excellent!
  * Collecting, player customization, fashion, and socializing are some of the most important game aspects.
  * 

### troubleshooting

    .devbox/virtenv/postgresql/data" is not a database cluster directory

@see https://www.danielcorin.com/til/devbox/quick-postgres-db/


### log

* 2026-01-06 implemented pathfinding
* 2026-01-07 integrate nostr auth with svelte