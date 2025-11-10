Vagrant.configure("2") do |config|
  # Configuración común para todas las VMs (puede ajustarse según necesidad)
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 1024
    vb.cpus   = 1
  end

  # =========================
  # VM1 - Servidor Web / API
  # =========================
  config.vm.define "vm1" do |vm1|
    vm1.vm.box         = "VM1_ProyectoFinal_ServiciosTelematicos/VM1"
    vm1.vm.box_version = "0.0.1"
    vm1.vm.hostname    = "vm1-api"

    # Misma IP que el vagrant file original 
    vm1.vm.network "private_network", ip: "192.168.50.10"
  end

  # =========================
  # VM2 - Servidor Web + BD
  # =========================
  config.vm.define "vm2" do |vm2|
    vm2.vm.box         = "VM2_ProyectoFinal_ServiciosTelematicos/VM2"
    vm2.vm.box_version = "0.0.1"
    vm2.vm.hostname    = "vm2-db"

    vm2.vm.network "private_network", ip: "192.168.50.20"
  end

  # =========================
  # VM3 - Load Balancer
  # =========================
  config.vm.define "vm3" do |vm3|
    vm3.vm.box         = "VM3_ProyectoFinal_ServiciosTelematicos/VM3"
    vm3.vm.box_version = "0.0.1"
    vm3.vm.hostname    = "loadbalancer"

    vm3.vm.network "private_network", ip: "192.168.50.30"
  end
end
