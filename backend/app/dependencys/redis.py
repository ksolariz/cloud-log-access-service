# import redis

# r = redis.Redis(host='localhost', port=6379, db=0)


import redis
from app.dependencys import env_vars

r = redis.Redis(host=env_vars.get("REDIS_HOST"), port=env_vars.get("REDIS_PORT"), db=0)
