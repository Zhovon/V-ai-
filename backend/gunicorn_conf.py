import multiprocessing
import os

# Gunicorn configuration file

# The number of worker processes for handling requests.
# A positive integer generally in the 2-4 x $(NUM_CORES) range.
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))

# The socket to bind
bind = "0.0.0.0:" + os.environ.get("PORT", "8000")

# The type of workers to use
worker_class = "uvicorn.workers.UvicornWorker"

# The maximum number of pending connections.
backlog = 2048

# Workers silent for more than this many seconds are killed and restarted.
timeout = 120

# The number of worker threads for handling requests.
threads = int(os.environ.get("GUNICORN_THREADS", 2))

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
