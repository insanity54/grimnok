# The adventures of Grimnâk

## Project requirements

* [x] [devbox](https://www.jetify.com/docs/devbox/installing-devbox)
* [x] club penguin style movement
* [ ] Fantasy RPG
* [ ] Easy to update
* [ ] Fun to play
* [ ] Nakama multiplayer
* [ ] Nostr auth
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


### troubleshooting

    .devbox/virenv/postgresql/data" is not a database cluster directory

@see https://www.danielcorin.com/til/devbox/quick-postgres-db/