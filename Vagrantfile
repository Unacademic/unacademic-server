# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = 'ubuntu/trusty64'
  config.ssh.forward_agent = true

  # import local ssh key and authorize it in the vagrant box
  id_rsa_ssh_key_pub = File.read(File.join(Dir.home, ".ssh", "id_rsa.pub"))
  config.vm.provision :shell, :inline => "echo '#{id_rsa_ssh_key_pub }' >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"

  config.vm.define "unacademic-web-01" do |server|
    server.vm.hostname = "unacademic-web-01"
    server.vm.network :private_network, ip: "33.33.33.33"
    server.vm.synced_folder ".", "/home/deploy/unacademic"

    server.vm.provider "virtualbox" do |box|
      box.name = "unacademic-web-01"
      box.customize [ "modifyvm", :id, "--memory", "1024" ]
      box.customize [ "modifyvm", :id, "--natdnshostresolver1", "on" ]
    end
  end

end
