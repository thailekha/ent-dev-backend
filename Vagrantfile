# curl -L https://github.com/docker/compose/releases/download/1.17.0/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
Vagrant.configure("2") do |config|
  common_config = ->(config) do
    config.vm.hostname="vagrant"
    config.vm.box = "ubuntu/trusty64"
    config.vm.box_check_update = false
    config.vbguest.auto_update = false

    config.vm.synced_folder ".", "/mnt/vagrant"

    config.vm.provider "virtualbox" do |v|
      v.customize ["modifyvm", :id, "--cpuexecutioncap", "100"]
      v.customize ["modifyvm", :id, "--memory", "512"]
    end    
  end

  forward_port = ->(guest, host = guest) do
    config.vm.network :forwarded_port,
      guest: guest,
      host: host,
      auto_correct: true
  end

  fix_tty = ->(config) do
    config.vm.provision "fix-no-tty", type: "shell" do |s|
      s.privileged = false
      s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
    end
  end

  install_docker = ->(config) do
    config.vm.provision "shell", inline: <<-SHELL
      apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
      apt-key fingerprint 0EBFCD88 | grep docker@docker.com || exit 1
      add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
      apt-get update
      apt-get install -y docker-ce
      docker --version

      curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/bin/docker-compose
      chmod +x /usr/bin/docker-compose
      docker-compose --version
      docker pull mongo

      apt-get install mongodb-clients
    SHELL
  end

  install_node = ->(config) do
    config.vm.provision "shell", inline: <<-SHELL
      curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
      apt-get install -y nodejs
      npm i -g yarn
    SHELL
  end

  config.vm.define "devbox" do |devbox|
    forward_port[4040]
    common_config[devbox]
    fix_tty[devbox]
    install_docker[devbox]
    install_node[devbox]
  end
end