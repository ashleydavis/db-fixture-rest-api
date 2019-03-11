# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.network "forwarded_port", guest: 80, host: 4000
  config.vm.network "forwarded_port", guest: 8080, host: 4010
  config.vm.provision "shell", path: "./scripts/provision-dev-vm.sh"
end
