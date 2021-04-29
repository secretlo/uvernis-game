import storage
import json
import requests
import socket


def connect_game(game_id, callback):
   storage.game_id = game_id
   print('Connect Game: game_id =', storage.game_id)
   
   storage.run_server()

   res = storage.load('/game', {
      'action': 'connect',
      'game_id': storage.game_id,
      'host': f'{storage.host}:{storage.port}',
   })
   
   if res['status'] == 'OK':
      storage.connection_count = res['connection_count']

   callback.Call(res)

