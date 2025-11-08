# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Box base
  config.vm.box = "ubuntu/focal64"
  config.vm.synced_folder ".", "/vagrant"

  # ---- VM1: Web Server 1 ----------------------------------------------------
  config.vm.define "vm1" do |vm1|
    vm1.vm.hostname = "vm1"
    vm1.vm.network "private_network", ip: "192.168.50.10"
    vm1.vm.provider "virtualbox" do |vb|
      vb.name   = "WebServer1"
      vb.memory = 1024
      vb.cpus   = 1
    end
    vm1.vm.provision "shell", inline: <<-SHELL
      set -eux
      export DEBIAN_FRONTEND=noninteractive
      apt-get update
      apt-get install -y apache2

      # Página de prueba que identifica el nodo
      cat >/var/www/html/index.html <<'EOF'
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>VM1</title></head>
      <body style="font-family: sans-serif">
        <h1>Servidor Web 1</h1>
        <p>Hostname: vm1</p>
        <p>IP: 192.168.50.10</p>
      </body></html>
      EOF

      systemctl enable apache2
      systemctl restart apache2
    SHELL
  end

  # ---- VM2: Web Server 2 ----------------------------------------------------
  config.vm.define "vm2" do |vm2|
    vm2.vm.hostname = "vm2"
    vm2.vm.network "private_network", ip: "192.168.50.20"
    vm2.vm.provider "virtualbox" do |vb|
      vb.name   = "WebServer2"
      vb.memory = 1024
      vb.cpus   = 1
    end
    vm2.vm.provision "shell", inline: <<-SHELL
      set -eux
      export DEBIAN_FRONTEND=noninteractive
      apt-get update
      apt-get install -y apache2

      # Página de prueba que identifica el nodo
      cat >/var/www/html/index.html <<'EOF'
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>VM2</title></head>
      <body style="font-family: sans-serif">
        <h1>Servidor Web 2</h1>
        <p>Hostname: vm2</p>
        <p>IP: 192.168.50.20</p>
      </body></html>
      EOF

      systemctl enable apache2
      systemctl restart apache2
    SHELL
  end

  # ---- VM3: Load Balancer (Apache mod_proxy_balancer) -----------------------
  config.vm.define "vm3" do |vm3|
    vm3.vm.hostname = "vm3"
    vm3.vm.network "private_network", ip: "192.168.50.30"
    vm3.vm.provider "virtualbox" do |vb|
      vb.name   = "LoadBalancer"
      vb.memory = 1024
      vb.cpus   = 1
    end
    vm3.vm.provision "shell", inline: <<-SHELL
      set -eux
      export DEBIAN_FRONTEND=noninteractive
      apt-get update
      apt-get install -y apache2

      # Módulos necesarios para balanceo y estadísticas
      a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests slotmem_shm
      a2enmod status

      # VirtualHost del balanceador
      cat >/etc/apache2/sites-available/loadbalancer.conf <<'EOF'
<VirtualHost *:80>
    ServerName 192.168.50.30
    ServerAdmin admin@example.local

    # Definición del clúster
    <Proxy "balancer://mycluster">
        BalancerMember http://192.168.50.10
        BalancerMember http://192.168.50.20
        ProxySet lbmethod=byrequests
    </Proxy>

    ProxyPreserveHost On
    ProxyPass        / balancer://mycluster/
    ProxyPassReverse / balancer://mycluster/

    # Paneles de control (abiertos para prácticas de laboratorio)
    <Location "/balancer-manager">
        SetHandler balancer-manager
        Require all granted
    </Location>

    <Location "/server-status">
        SetHandler server-status
        Require all granted
    </Location>

    ErrorLog ${APACHE_LOG_DIR}/balancer_error.log
    CustomLog ${APACHE_LOG_DIR}/balancer_access.log combined
</VirtualHost>
EOF

      a2dissite 000-default.conf
      a2ensite loadbalancer.conf
      systemctl enable apache2
      systemctl restart apache2
    SHELL
  end
end



