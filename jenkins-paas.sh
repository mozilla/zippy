if [ -f /opt/rh/python27/enable ]; then
  source /opt/rh/python27/enable
fi

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
pip install --upgrade tardy

# In this case the jenkins user has stackato credentials to hit the server.
tardy -q -a update
