@echo off
echo Starting Celery Worker...
start cmd /k "celery -A TurfField worker -l info -P solo"

echo Starting Celery Bear...
start cmd /k "celery -A TurfField beat -l info"

echo Celery Initialization Completed
