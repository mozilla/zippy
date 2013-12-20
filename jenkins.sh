set -e

cd $WORKSPACE
VENV=$WORKSPACE/venv

if [ ! -d "$VENV/bin" ]; then
  echo "No virtualenv found.  Making one..."
  virtualenv $VENV --system-site-packages --python=python
  source $VENV/bin/activate
  pip install --upgrade pip
fi

source $VENV/bin/activate
pip install tardy

# In this case the jenkins user has stackato credentials to hit the server.
tardy -f tardy.json -u
