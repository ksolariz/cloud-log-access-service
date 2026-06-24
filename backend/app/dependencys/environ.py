import environ
import os

env = environ.Env()
# # reading .env file
environ.Env.read_env(env.str('/', '.env'))

env_vars = os.environ