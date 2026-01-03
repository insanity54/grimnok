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
* [ ] Monsters
* [ ] Loot
* [ ] General store
* [ ] Leaderboard
* [ ] portals (travel between maps)
* [ ] Town Square
* [ ] maps
* [ ] Beast keeper, cron restock
* [ ] chat
* [ ] Home stable, beast collection view
* [ ] fun cursors, hover fx
* [ ] gacha for sats
* [ ] paint brush
* [ ] gambling
* [ ] fishing
* [ ] mythic (anything)
* [ ] void rondo
* [ ] Sword in stone-- 1 in 1 million chance of pulling rare item
* [ ] 


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