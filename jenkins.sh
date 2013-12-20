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

# Switch to user that has stackato access to this repository.
su amckay -c "tardy -f tardy.json -u"
