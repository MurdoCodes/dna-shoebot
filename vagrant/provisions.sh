sudo apt-get update && sudo apt-get upgrade -y

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash
   
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
   
nvm install node
npm install -g gulp
sudo apt-get install -y --no-install-recommends ubuntu-desktop
sudo apt-get install -y gnupg2
sudo apt-get install -y git
sudo apt-get install -y xrdp
sudo apt-get install -y xfce4
sudo apt-get install -y xfce4-goodies
sudo apt-get install -y xvfb
sudo apt-get -y install xorg xvfb gtk2-engines-pixbuf
sudo apt-get -y install dbus-x11 xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-scalable

echo xfce4-session > ~/.xsession