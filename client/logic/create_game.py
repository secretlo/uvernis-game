import storage
import json
import requests
import socket


def create_game(callback):
   res = storage.load('/create-game', {})
   
   if res['status'] == 'OK':
      print('Create Game: respond OK')
      print('Create Game: game_id =', res['game_id'])
      storage.game_id = res['game_id']
      storage.run_server()
      res = storage.load('/game', {
         'action': 'connect',
         'game_id': storage.game_id,
         'host': f'{storage.host}:{storage.port}',
      })
      
      if res['status'] == 'OK':
         storage.connection_count = res['connection_count']
   
   callback.Call(res)
